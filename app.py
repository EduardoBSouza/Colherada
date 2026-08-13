#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Colherada - Sistema de Controle de Vendas SIMPLIFICADO
Servidor com autenticação básica e persistência de dados
"""

from flask import Flask, jsonify, request, send_from_directory, session, make_response
from flask_cors import CORS
import secrets
from datetime import datetime
from database import carregar_dados, salvar_dados, init_database, inicializar_dados

app = Flask(__name__)
app.secret_key = secrets.token_hex(32)
CORS(app, supports_credentials=True)

# Custo de produção por unidade
CUSTO_UNITARIO = 7.00

# Tabela de preços por tamanho e sabor
PRECOS = {
    '80g': {'Leite Condensado': 10, 'Coco': 10, 'Chocolate': 12, 'Doce de Leite': 12},
    '150g': {'Leite Condensado': 16, 'Coco': 16, 'Chocolate': 18, 'Doce de Leite': 18},
    '500g': {'Leite Condensado': 34, 'Coco': 34, 'Chocolate': 40, 'Doce de Leite': 40},
    '1kg': {'Leite Condensado': 60, 'Coco': 60, 'Chocolate': 70, 'Doce de Leite': 70}
}

# Credenciais (simplificado - sem banco de dados)
USUARIO_PADRAO = 'NNK'
SENHA_PADRAO = 'pudimcolherada'

# Inicializar banco de dados (se estiver usando PostgreSQL)
init_database()

# ========== ROTAS DE PÁGINAS ==========

@app.route('/')
def index():
    """Serve a página de login"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_file(filename):
    """Serve arquivos HTML, CSS, JS"""
    try:
        if filename.endswith('.html') or \
           (filename.startswith('styles/') and filename.endswith('.css')) or \
           (filename.startswith('scripts/') and filename.endswith('.js')):
            return send_from_directory('.', filename)
        return "Não encontrado", 404
    except:
        return "Não encontrado", 404

# ========== ROTAS DA API ==========

@app.route('/api/login', methods=['POST'])
def login():
    """Rota de login simplificada"""
    try:
        dados = request.json
        usuario = dados.get('usuario', '').strip()
        senha = dados.get('senha', '')
        
        if usuario == USUARIO_PADRAO and senha == SENHA_PADRAO:
            session['autenticado'] = True
            session['usuario'] = usuario
            return jsonify({
                'success': True,
                'message': 'Login realizado com sucesso!',
                'nome': 'Colherada'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Usuário ou senha incorretos'
            }), 401
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    """Rota de logout"""
    session.clear()
    return jsonify({'success': True, 'message': 'Logout realizado com sucesso!'})

@app.route('/api/dados', methods=['GET'])
def obter_dados():
    """Retorna todos os dados com estoque_total já calculado"""
    dados = carregar_dados()
    
    # Calcular estoque_total no backend para garantir que chegue como número
    estoque = dados.get('estoque', {})
    if isinstance(estoque, dict):
        estoque_total = int(estoque.get('80g', 0)) + int(estoque.get('150g', 0)) + int(estoque.get('500g', 0)) + int(estoque.get('1kg', 0))
    else:
        estoque_total = int(estoque) if estoque else 0
    
    dados['estoque_total'] = estoque_total
    
    # Desabilitar cache no navegador
    response = make_response(jsonify(dados))
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/api/dados', methods=['POST'])
def salvar_dados_api():
    """Salva dados recebidos"""
    try:
        dados = request.json
        salvar_dados(dados)
        return jsonify({'success': True, 'message': 'Dados salvos com sucesso!'})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Erro ao salvar dados.', 'erro': str(e)}), 500

@app.route('/api/venda', methods=['POST'])
def registrar_venda():
    """Registra uma nova venda"""
    try:
        venda = request.json
        dados = carregar_dados()
        
        # Obter valores da venda
        quantidade = venda.get('quantidade', 0)
        tamanho = venda.get('tamanho', '150g')
        sabor = venda.get('sabor', '')
        valor_unitario = venda.get('valor_unitario', 0)
        valor_total = venda.get('valor_total', quantidade * valor_unitario)
        pagamento = venda.get('pagamento', '')
        
        # Garantir que estoque é um dict
        if not isinstance(dados['estoque'], dict):
            dados['estoque'] = {'80g': 0, '150g': dados.get('estoque', 0), '500g': 0, '1kg': 0}
        
        # Criar objeto de venda completo
        venda_completa = {
            'quantidade': quantidade,
            'tamanho': tamanho,
            'sabor': sabor,
            'valor_unitario': valor_unitario,
            'valor_total': valor_total,
            'pagamento': pagamento,
            'data_hora': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'timestamp': datetime.now().isoformat()
        }
        
        # Adicionar venda ao histórico
        dados['vendas'].append(venda_completa)
        
        # Atualizar estoque do tamanho específico
        if tamanho in dados['estoque']:
            dados['estoque'][tamanho] -= quantidade
        
        # Atualizar financeiro
        dados['faturamento_bruto'] += valor_total
        
        # Calcular e atualizar lucro líquido
        custo_total = quantidade * CUSTO_UNITARIO
        lucro_venda = valor_total - custo_total
        dados['lucro_liquido'] += lucro_venda
        
        salvar_dados(dados)
        return jsonify({'success': True, 'message': 'Venda registrada com sucesso!', 'dados': dados})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Erro ao registrar venda.', 'erro': str(e)}), 500

@app.route('/api/editar_venda', methods=['POST'])
def editar_venda():
    """Edita uma venda existente"""
    try:
        body = request.json
        venda_index = body.get('index')
        
        if venda_index is None:
            return jsonify({'success': False, 'message': 'Índice da venda não fornecido'}), 400
        
        dados = carregar_dados()
        
        if venda_index < 0 or venda_index >= len(dados['vendas']):
            return jsonify({'success': False, 'message': 'Venda não encontrada'}), 404
        
        # Obter a venda antiga para calcular a diferença
        venda_antiga = dados['vendas'][venda_index]
        
        # Obter valores da venda nova
        quantidade_nova = body.get('quantidade', venda_antiga.get('quantidade', 0))
        tamanho_novo = body.get('tamanho', venda_antiga.get('tamanho', '150g'))
        sabor_novo = body.get('sabor', venda_antiga.get('sabor', ''))
        valor_unitario_novo = body.get('valor_unitario', venda_antiga.get('valor_unitario', 0))
        valor_total_novo = body.get('valor_total', quantidade_nova * valor_unitario_novo)
        pagamento_novo = body.get('pagamento', venda_antiga.get('pagamento', ''))
        
        # Garantir que estoque é um dict
        if not isinstance(dados['estoque'], dict):
            dados['estoque'] = {'80g': 0, '150g': dados.get('estoque', 0), '500g': 0, '1kg': 0}
        
        # Calcular diferenças para ajustar estoque
        quantidade_diff = quantidade_nova - venda_antiga.get('quantidade', 0)
        tamanho_antigo = venda_antiga.get('tamanho', '150g')
        
        # Se o tamanho mudou, devolver a quantidade antiga e descontar a nova
        if tamanho_novo != tamanho_antigo:
            if tamanho_antigo in dados['estoque']:
                dados['estoque'][tamanho_antigo] += venda_antiga.get('quantidade', 0)
            if tamanho_novo in dados['estoque']:
                dados['estoque'][tamanho_novo] -= quantidade_nova
        else:
            # Se o tamanho não mudou, apenas ajustar a quantidade
            if tamanho_novo in dados['estoque']:
                dados['estoque'][tamanho_novo] -= quantidade_diff
        
        # Calcular diferenças financeiras
        valor_total_antigo = venda_antiga.get('valor_total', 0)
        valor_diff = valor_total_novo - valor_total_antigo
        
        # Atualizar faturamento bruto
        dados['faturamento_bruto'] += valor_diff
        
        # Recalcular lucro líquido
        custo_total_antigo = venda_antiga.get('quantidade', 0) * CUSTO_UNITARIO
        lucro_antigo = valor_total_antigo - custo_total_antigo
        
        custo_total_novo = quantidade_nova * CUSTO_UNITARIO
        lucro_novo = valor_total_novo - custo_total_novo
        
        lucro_diff = lucro_novo - lucro_antigo
        dados['lucro_liquido'] += lucro_diff
        
        # Atualizar a venda
        dados['vendas'][venda_index] = {
            'quantidade': quantidade_nova,
            'tamanho': tamanho_novo,
            'sabor': sabor_novo,
            'valor_unitario': valor_unitario_novo,
            'valor_total': valor_total_novo,
            'pagamento': pagamento_novo,
            'data_hora': venda_antiga.get('data_hora'),
            'timestamp': venda_antiga.get('timestamp'),
            'editado_em': datetime.now().isoformat()
        }
        
        salvar_dados(dados)
        return jsonify({'success': True, 'message': 'Venda atualizada com sucesso!', 'dados': dados})
    except Exception as e:
        print(f'Erro ao editar venda: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Erro ao editar venda.', 'erro': str(e)}), 500

@app.route('/api/remover_venda', methods=['POST'])
def remover_venda():
    """Remove uma venda existente"""
    try:
        body = request.json
        venda_index = body.get('index')
        
        if venda_index is None:
            return jsonify({'success': False, 'message': 'Índice da venda não fornecido'}), 400
        
        dados = carregar_dados()
        
        if venda_index < 0 or venda_index >= len(dados['vendas']):
            return jsonify({'success': False, 'message': 'Venda não encontrada'}), 404
        
        # Obter a venda a ser removida
        venda = dados['vendas'][venda_index]
        
        # Garantir que estoque é um dict
        if not isinstance(dados['estoque'], dict):
            dados['estoque'] = {'80g': 0, '150g': dados.get('estoque', 0), '500g': 0, '1kg': 0}
        
        # Devolver quantidade ao estoque
        tamanho = venda.get('tamanho', '150g')
        quantidade = venda.get('quantidade', 0)
        if tamanho in dados['estoque']:
            dados['estoque'][tamanho] += quantidade
        
        # Subtrair do faturamento bruto
        valor_total = venda.get('valor_total', 0)
        dados['faturamento_bruto'] -= valor_total
        
        # Recalcular lucro líquido
        custo_total = quantidade * CUSTO_UNITARIO
        lucro_venda = valor_total - custo_total
        dados['lucro_liquido'] -= lucro_venda
        
        # Remover a venda
        dados['vendas'].pop(venda_index)
        
        salvar_dados(dados)
        return jsonify({'success': True, 'message': 'Venda removida com sucesso!', 'dados': dados})
    except Exception as e:
        print(f'Erro ao remover venda: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Erro ao remover venda.', 'erro': str(e)}), 500

@app.route('/api/abastecer', methods=['POST'])
def abastecer_estoque():
    """Abastece o estoque"""
    try:
        body = request.json
        quantidade = body.get('quantidade', 0)
        tamanho = body.get('tamanho', '150g')
        
        dados = carregar_dados()
        
        # Garantir que estoque é um dict
        if not isinstance(dados['estoque'], dict):
            dados['estoque'] = {'80g': 0, '150g': dados.get('estoque', 0), '500g': 0, '1kg': 0}
        
        # Abastecer o tamanho específico
        if tamanho in dados['estoque']:
            dados['estoque'][tamanho] += quantidade
        
        salvar_dados(dados)
        return jsonify({'success': True, 'message': 'Estoque abastecido com sucesso!', 'estoque': dados['estoque']})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Erro ao abastecer estoque.', 'erro': str(e)}), 500

@app.route('/api/remover_estoque', methods=['POST'])
def remover_estoque():
    """Remove do estoque"""
    try:
        body = request.json
        quantidade = body.get('quantidade', 0)
        tamanho = body.get('tamanho', '150g')
        
        dados = carregar_dados()
        
        # Garantir que estoque é um dict
        if not isinstance(dados['estoque'], dict):
            dados['estoque'] = {'80g': 0, '150g': dados.get('estoque', 0), '500g': 0, '1kg': 0}
        
        # Remover do tamanho específico
        if tamanho in dados['estoque']:
            dados['estoque'][tamanho] -= quantidade
            if dados['estoque'][tamanho] < 0:
                dados['estoque'][tamanho] = 0
        
        salvar_dados(dados)
        return jsonify({'success': True, 'message': 'Estoque atualizado com sucesso!', 'estoque': dados['estoque']})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Erro ao remover do estoque.', 'erro': str(e)}), 500

@app.route('/api/encomenda', methods=['POST'])
def registrar_encomenda():
    """Registra uma nova encomenda"""
    try:
        encomenda = request.json
        dados = carregar_dados()
        
        # Adicionar ID único
        encomenda['id'] = len(dados['encomendas']) + 1
        encomenda['status'] = 'pendente'
        encomenda['criado_em'] = datetime.now().isoformat()
        
        # Garantir que tamanho existe
        if 'tamanho' not in encomenda:
            encomenda['tamanho'] = '150g'
        
        dados['encomendas'].append(encomenda)
        salvar_dados(dados)
        
        return jsonify({'success': True, 'message': 'Encomenda registrada com sucesso!', 'encomenda': encomenda})
    except Exception as e:
        print(f'Erro ao registrar encomenda: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Erro ao registrar encomenda.', 'erro': str(e)}), 500

@app.route('/api/concluir_encomenda', methods=['POST'])
def concluir_encomenda():
    """Marca encomenda como concluída"""
    try:
        body = request.json
        encomenda_id = body.get('id')
        
        dados = carregar_dados()
        
        for enc in dados['encomendas']:
            if enc.get('id') == encomenda_id:
                enc['status'] = 'concluida'
                enc['concluido_em'] = datetime.now().isoformat()
                break
        
        salvar_dados(dados)
        return jsonify({'success': True, 'message': 'Encomenda concluída com sucesso!'})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Erro ao concluir encomenda.', 'erro': str(e)}), 500

@app.route('/api/obter_encomenda/<int:id>', methods=['GET'])
def obter_encomenda(id):
    """Obtém uma encomenda específica"""
    try:
        dados = carregar_dados()
        
        for enc in dados['encomendas']:
            if enc.get('id') == id:
                return jsonify({'success': True, 'encomenda': enc})
        
        return jsonify({'success': False, 'message': 'Encomenda não encontrada'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': 'Erro ao obter encomenda.', 'erro': str(e)}), 500

@app.route('/api/editar_encomenda', methods=['POST'])
def editar_encomenda():
    """Edita uma encomenda existente"""
    try:
        body = request.json
        encomenda_id = body.get('id')
        
        dados = carregar_dados()
        
        for enc in dados['encomendas']:
            if enc.get('id') == encomenda_id:
                # Atualizar campos editáveis
                enc['cliente'] = body.get('cliente', enc.get('cliente'))
                enc['telefone'] = body.get('telefone', enc.get('telefone'))
                enc['tamanho'] = body.get('tamanho', enc.get('tamanho'))
                enc['sabor'] = body.get('sabor', enc.get('sabor'))
                enc['quantidade'] = body.get('quantidade', enc.get('quantidade'))
                enc['data'] = body.get('data', enc.get('data'))
                enc['observacoes'] = body.get('observacoes', enc.get('observacoes'))
                enc['editado_em'] = datetime.now().isoformat()
                
                salvar_dados(dados)
                return jsonify({'success': True, 'message': 'Encomenda atualizada com sucesso!', 'encomenda': enc})
        
        return jsonify({'success': False, 'message': 'Encomenda não encontrada'}), 404
    except Exception as e:
        print(f'Erro ao editar encomenda: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Erro ao editar encomenda.', 'erro': str(e)}), 500

@app.route('/api/cancelar_encomenda', methods=['POST'])
def cancelar_encomenda():
    """Cancela uma encomenda"""
    try:
        body = request.json
        encomenda_id = body.get('id')
        
        dados = carregar_dados()
        
        for enc in dados['encomendas']:
            if enc.get('id') == encomenda_id:
                enc['status'] = 'cancelada'
                enc['cancelado_em'] = datetime.now().isoformat()
                break
        
        salvar_dados(dados)
        return jsonify({'success': True, 'message': 'Encomenda cancelada com sucesso!'})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Erro ao cancelar encomenda.', 'erro': str(e)}), 500

@app.route('/api/salvar_receita', methods=['POST'])
def salvar_receita():
    """Salva receita"""
    try:
        body = request.json
        titulo = body.get('titulo', '')
        conteudo = body.get('conteudo', '')
        
        dados = carregar_dados()
        
        # Adicionar campo de receita se não existir
        if 'receita' not in dados:
            dados['receita'] = {}
        
        dados['receita'] = {
            'titulo': titulo,
            'conteudo': conteudo,
            'atualizado_em': datetime.now().isoformat()
        }
        
        salvar_dados(dados)
        return jsonify({'success': True, 'message': 'Receita salva com sucesso!'})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Erro ao salvar receita.', 'erro': str(e)}), 500

@app.route('/api/receita', methods=['GET'])
def obter_receita():
    """Obtém receita salva"""
    try:
        dados = carregar_dados()
        receita = dados.get('receita', {})
        return jsonify(receita)
    except Exception as e:
        return jsonify({'success': False, 'message': 'Erro ao carregar receita.', 'erro': str(e)}), 500

@app.route('/api/resetar_dados', methods=['POST'])
def resetar_dados():
    """Zera os dados cadastrais (estoque, vendas, financeiro, encomendas), preservando apenas a receita"""
    try:
        if not session.get('autenticado'):
            return jsonify({'success': False, 'message': 'Não autenticado'}), 401

        dados_atual = carregar_dados()
        dados_limpos = inicializar_dados()
        dados_limpos['receita'] = dados_atual.get('receita', dados_limpos['receita'])
        salvar_dados(dados_limpos)

        return jsonify({
            'success': True,
            'message': 'Dados zerados com sucesso, mantendo a receita.',
            'dados': dados_limpos
        })
    except Exception as e:
        return jsonify({'success': False, 'message': 'Erro ao resetar dados.', 'erro': str(e)}), 500

@app.route('/api/restaurar_financeiro', methods=['POST'])
def restaurar_financeiro():
    """Restaura dados financeiros (faturamento e lucro) - USE COM CUIDADO"""
    try:
        if not session.get('autenticado'):
            return jsonify({'success': False, 'message': 'Não autenticado'}), 401

        dados_json = request.json
        dados_atual = carregar_dados()
        
        # Restaurar faturamento e lucro
        if 'faturamento_bruto' in dados_json:
            dados_atual['faturamento_bruto'] = dados_json['faturamento_bruto']
        if 'lucro_liquido' in dados_json:
            dados_atual['lucro_liquido'] = dados_json['lucro_liquido']
        
        salvar_dados(dados_atual)
        
        return jsonify({
            'success': True,
            'message': 'Dados financeiros restaurados com sucesso!',
            'faturamento_bruto': dados_atual['faturamento_bruto'],
            'lucro_liquido': dados_atual['lucro_liquido']
        })
    except Exception as e:
        return jsonify({'success': False, 'message': 'Erro ao restaurar dados.', 'erro': str(e)}), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🍮 COLHERADA - Sistema de Vendas")
    print("=" * 60)
    print()
    print("✅ Servidor rodando na porta 5000")
    print("🌐 Acesse: http://localhost:5000")
    print("🔐 Login: NNK | Senha: pudimcolherada")
    print()
    print("=" * 60)
    print()
    
    app.run(host='0.0.0.0', port=5000, debug=False)
