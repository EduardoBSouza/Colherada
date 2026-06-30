#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Colherada - Sistema de Controle de Vendas SIMPLIFICADO
Servidor com autenticação básica e persistência de dados
"""

from flask import Flask, jsonify, request, send_from_directory, session
from flask_cors import CORS
import secrets
from datetime import datetime
from database import carregar_dados, salvar_dados, init_database

app = Flask(__name__)
app.secret_key = secrets.token_hex(32)
CORS(app, supports_credentials=True)

# Custo de produção por unidade
CUSTO_UNITARIO = 7.00

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
        return "Not Found", 404
    except:
        return "Not Found", 404

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
    return jsonify({'success': True})

@app.route('/api/dados', methods=['GET'])
def obter_dados():
    """Retorna todos os dados com estoque_total já calculado"""
    dados = carregar_dados()
    
    # Calcular estoque_total no backend para garantir que chegue como número
    estoque = dados.get('estoque', {})
    if isinstance(estoque, dict):
        estoque_total = int(estoque.get('80g', 0)) + int(estoque.get('150g', 0)) + int(estoque.get('500g', 0))
    else:
        estoque_total = int(estoque) if estoque else 0
    
    dados['estoque_total'] = estoque_total
    return jsonify(dados)

@app.route('/api/dados', methods=['POST'])
def salvar_dados_api():
    """Salva dados recebidos"""
    try:
        dados = request.json
        salvar_dados(dados)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/venda', methods=['POST'])
def registrar_venda():
    """Registra uma nova venda"""
    try:
        venda = request.json
        dados = carregar_dados()
        
        # Obter valores da venda
        quantidade = venda.get('quantidade', 0)
        tamanho = venda.get('tamanho', '150g')
        valor_unitario = venda.get('valor_unitario', 0)
        valor_total = venda.get('valor_total', quantidade * valor_unitario)
        pagamento = venda.get('pagamento', '')
        
        # Garantir que estoque é um dict
        if not isinstance(dados['estoque'], dict):
            dados['estoque'] = {'80g': 0, '150g': dados.get('estoque', 0), '500g': 0}
        
        # Criar objeto de venda completo
        venda_completa = {
            'quantidade': quantidade,
            'tamanho': tamanho,
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
        return jsonify({'success': True, 'dados': dados})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

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
            dados['estoque'] = {'80g': 0, '150g': dados.get('estoque', 0), '500g': 0}
        
        # Abastecer o tamanho específico
        if tamanho in dados['estoque']:
            dados['estoque'][tamanho] += quantidade
        
        salvar_dados(dados)
        return jsonify({'success': True, 'estoque': dados['estoque']})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

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
            dados['estoque'] = {'80g': 0, '150g': dados.get('estoque', 0), '500g': 0}
        
        # Remover do tamanho específico
        if tamanho in dados['estoque']:
            dados['estoque'][tamanho] -= quantidade
            if dados['estoque'][tamanho] < 0:
                dados['estoque'][tamanho] = 0
        
        salvar_dados(dados)
        return jsonify({'success': True, 'estoque': dados['estoque']})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

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
        
        return jsonify({'success': True, 'encomenda': encomenda})
    except Exception as e:
        print(f'Erro ao registrar encomenda: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

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
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

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
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

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
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/receita', methods=['GET'])
def obter_receita():
    """Obtém receita salva"""
    try:
        dados = carregar_dados()
        receita = dados.get('receita', {})
        return jsonify(receita)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
