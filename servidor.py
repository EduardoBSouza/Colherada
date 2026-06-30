#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Servidor Backend para PDV - Pudim Artesanal
Sincroniza dados entre múltiplos dispositivos
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Permite requisições de qualquer origem

# Arquivo para armazenar os dados
DADOS_FILE = 'dados_pdv.json'

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
        'faturamentoBruto': 0,
        'lucroLiquido': 0,
        'vendas': [],
        'encomendas': [],
        'data': datetime.now().strftime('%d/%m/%Y')
    }

def salvar_dados(dados):
    """Salva dados no arquivo JSON"""
    with open(DADOS_FILE, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)

# ========== ROTAS DA API ==========

@app.route('/')
def index():
    """Serve o arquivo HTML principal"""
    return send_from_directory('.', 'index.html')

@app.route('/api/dados', methods=['GET'])
def obter_dados():
    """Retorna todos os dados do sistema"""
    dados = carregar_dados()
    return jsonify(dados)

@app.route('/api/dados', methods=['POST'])
def salvar_dados_api():
    """Salva/atualiza os dados do sistema"""
    dados = request.json
    salvar_dados(dados)
    return jsonify({'status': 'success', 'message': 'Dados salvos com sucesso!'})

@app.route('/api/sincronizar', methods=['POST'])
def sincronizar():
    """
    Sincroniza dados enviados pelo cliente com o servidor
    Retorna os dados atualizados
    """
    dados_cliente = request.json
    dados_servidor = carregar_dados()
    
    # Verificar se é do mesmo dia
    if dados_cliente.get('data') == dados_servidor.get('data'):
        # Merge inteligente: usar os dados mais recentes
        dados_servidor['estoque'] = dados_cliente.get('estoque', dados_servidor['estoque'])
        dados_servidor['faturamentoBruto'] = dados_cliente.get('faturamentoBruto', dados_servidor['faturamentoBruto'])
        dados_servidor['lucroLiquido'] = dados_cliente.get('lucroLiquido', dados_servidor['lucroLiquido'])
        dados_servidor['vendas'] = dados_cliente.get('vendas', dados_servidor['vendas'])
        dados_servidor['encomendas'] = dados_cliente.get('encomendas', dados_servidor['encomendas'])
    else:
        # Dia diferente, resetar dados
        dados_servidor = dados_cliente
    
    salvar_dados(dados_servidor)
    return jsonify(dados_servidor)

@app.route('/api/reset', methods=['POST'])
def resetar_dados():
    """Reseta todos os dados para o estado inicial"""
    dados = inicializar_dados()
    salvar_dados(dados)
    return jsonify({'status': 'success', 'message': 'Dados resetados!', 'dados': dados})

@app.route('/api/status', methods=['GET'])
def status():
    """Verifica se o servidor está online"""
    return jsonify({'status': 'online', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    print("=" * 60)
    print("🍮 SERVIDOR PDV - PUDIM ARTESANAL")
    print("=" * 60)
    print("\n📱 Acesse pelo celular/computador na mesma rede WiFi:")
    print("\n   http://192.168.15.173:5000")
    print("\n✅ Sincronização automática habilitada!")
    print("\n⚠️  Pressione Ctrl+C para parar o servidor")
    print("=" * 60)
    print("\n")
    
    # Inicializar dados se não existir
    if not os.path.exists(DADOS_FILE):
        salvar_dados(inicializar_dados())
    
    # Iniciar servidor
    app.run(host='0.0.0.0', port=5000, debug=False)
