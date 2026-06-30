#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Colherada - Sistema de Controle de Vendas SIMPLIFICADO
Servidor com autenticação básica
"""

from flask import Flask, jsonify, request, send_from_directory, session
from flask_cors import CORS
import json
import os
from datetime import datetime
import secrets

app = Flask(__name__)
app.secret_key = secrets.token_hex(32)
CORS(app, supports_credentials=True)

# Arquivo para armazenar os dados
DADOS_FILE = 'dados_pdv.json'

# Custo de produção por unidade
CUSTO_UNITARIO = 7.00

# Credenciais (simplificado - sem banco de dados)
USUARIO_PADRAO = 'NNK'
SENHA_PADRAO = 'pudimcolherada'

def carregar_dados():
    """Carrega dados do arquivo JSON"""
    if os.path.exists(DADOS_FILE):
        try:
            with open(DADOS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return inicializar_dados()
    return inicializar_dados()

def inicializar_dados():
    """Inicializa estrutura de dados padrão"""
    return {
        'estoque': 25,
        'faturamento_bruto': 0,
        'lucro_liquido': 0,
        'vendas': [],
        'encomendas': [],
        'data': datetime.now().strftime('%d/%m/%Y')
    }

def salvar_dados(dados):
    """Salva dados no arquivo JSON"""
    with open(DADOS_FILE, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)

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
    """Retorna todos os dados"""
    return jsonify(carregar_dados())

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
        valor_unitario = venda.get('valor_unitario', 0)
        valor_total = venda.get('valor_total', quantidade * valor_unitario)
        pagamento = venda.get('pagamento', '')
        
        # Criar objeto de venda completo
        venda_completa = {
            'quantidade': quantidade,
            'valor_unitario': valor_unitario,
            'valor_total': valor_total,
            'pagamento': pagamento,
            'data_hora': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'timestamp': datetime.now().isoformat()
        }
        
        # Adicionar venda ao histórico
        dados['vendas'].append(venda_completa)
        
        # Atualizar estoque
        dados['estoque'] -= quantidade
        
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
        
        dados = carregar_dados()
        dados['estoque'] += quantidade
        
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
        
        dados = carregar_dados()
        dados['estoque'] -= quantidade
        if dados['estoque'] < 0:
            dados['estoque'] = 0
        
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
        
        dados['encomendas'].append(encomenda)
        salvar_dados(dados)
        
        return jsonify({'success': True, 'encomenda': encomenda})
    except Exception as e:
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
