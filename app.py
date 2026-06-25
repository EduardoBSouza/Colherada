#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Colherada - Sistema de Controle de Vendas na Nuvem
Servidor Backend com sincronização em tempo real
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3
import json
import os
from datetime import datetime, timedelta
import threading
import time

app = Flask(__name__)
CORS(app)

# Configuração do banco de dados
DATABASE = 'colherada.db'

def get_db():
    """Conecta ao banco de dados SQLite"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Inicializa o banco de dados"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Tabela de dados diários
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS dados_diarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT UNIQUE NOT NULL,
            estoque INTEGER DEFAULT 25,
            faturamento_bruto REAL DEFAULT 0,
            lucro_liquido REAL DEFAULT 0,
            atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabela de vendas
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS vendas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT NOT NULL,
            hora TEXT NOT NULL,
            quantidade INTEGER NOT NULL,
            total REAL NOT NULL,
            forma_pagamento TEXT NOT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabela de encomendas
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS encomendas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data_encomenda TEXT NOT NULL,
            quantidade INTEGER NOT NULL,
            cliente TEXT NOT NULL,
            status TEXT DEFAULT 'pendente',
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Banco de dados inicializado!")

def limpar_dados_antigos():
    """Remove dados de dias anteriores (mantém últimos 30 dias)"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        data_limite = (datetime.now() - timedelta(days=30)).strftime('%d/%m/%Y')
        
        cursor.execute('DELETE FROM dados_diarios WHERE data < ?', (data_limite,))
        cursor.execute('DELETE FROM vendas WHERE data < ?', (data_limite,))
        
        conn.commit()
        conn.close()
        print(f"🗑️ Dados antigos removidos (antes de {data_limite})")
    except Exception as e:
        print(f"Erro ao limpar dados antigos: {e}")

def tarefa_limpeza_periodica():
    """Executa limpeza de dados a cada 24 horas"""
    while True:
        time.sleep(86400)  # 24 horas
        limpar_dados_antigos()

# ========== ROTAS DA API ==========

@app.route('/')
def index():
    """Serve o arquivo HTML principal"""
    return send_from_directory('.', 'index.html')

@app.route('/pdv-offline.html')
def offline():
    """Serve a versão offline"""
    return send_from_directory('.', 'pdv-offline.html')

@app.route('/api/dados', methods=['GET'])
def obter_dados():
    """Retorna todos os dados do dia atual"""
    try:
        data_hoje = datetime.now().strftime('%d/%m/%Y')
        conn = get_db()
        cursor = conn.cursor()
        
        # Buscar dados diários
        cursor.execute('SELECT * FROM dados_diarios WHERE data = ?', (data_hoje,))
        dados_dia = cursor.fetchone()
        
        if not dados_dia:
            # Criar registro para hoje
            cursor.execute('''
                INSERT INTO dados_diarios (data, estoque, faturamento_bruto, lucro_liquido)
                VALUES (?, 25, 0, 0)
            ''', (data_hoje,))
            conn.commit()
            
            dados_dia = {
                'estoque': 25,
                'faturamento_bruto': 0,
                'lucro_liquido': 0
            }
        else:
            dados_dia = dict(dados_dia)
        
        # Buscar vendas do dia
        cursor.execute('SELECT * FROM vendas WHERE data = ? ORDER BY id DESC', (data_hoje,))
        vendas = [dict(row) for row in cursor.fetchall()]
        
        # Buscar encomendas pendentes
        cursor.execute('SELECT * FROM encomendas WHERE status = "pendente" ORDER BY data_encomenda')
        encomendas = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        # Montar resposta
        resposta = {
            'estoque': dados_dia.get('estoque', 25),
            'faturamentoBruto': dados_dia.get('faturamento_bruto', 0),
            'lucroLiquido': dados_dia.get('lucro_liquido', 0),
            'vendas': [
                {
                    'hora': v['hora'],
                    'quantidade': v['quantidade'],
                    'total': v['total'],
                    'formaPagamento': v['forma_pagamento']
                }
                for v in vendas
            ],
            'encomendas': [
                {
                    'id': e['id'],
                    'data': e['data_encomenda'],
                    'quantidade': e['quantidade'],
                    'cliente': e['cliente']
                }
                for e in encomendas
            ],
            'data': data_hoje
        }
        
        return jsonify(resposta)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dados', methods=['POST'])
def salvar_dados():
    """Salva/atualiza os dados do sistema"""
    try:
        dados = request.json
        data_hoje = datetime.now().strftime('%d/%m/%Y')
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Atualizar dados diários
        cursor.execute('''
            INSERT OR REPLACE INTO dados_diarios (data, estoque, faturamento_bruto, lucro_liquido, atualizado_em)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (
            data_hoje,
            dados.get('estoque', 25),
            dados.get('faturamentoBruto', 0),
            dados.get('lucroLiquido', 0)
        ))
        
        # Limpar vendas do dia e inserir novamente
        cursor.execute('DELETE FROM vendas WHERE data = ?', (data_hoje,))
        for venda in dados.get('vendas', []):
            cursor.execute('''
                INSERT INTO vendas (data, hora, quantidade, total, forma_pagamento)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                data_hoje,
                venda['hora'],
                venda['quantidade'],
                venda['total'],
                venda['formaPagamento']
            ))
        
        # Limpar encomendas pendentes e inserir novamente
        cursor.execute('DELETE FROM encomendas WHERE status = "pendente"')
        for encomenda in dados.get('encomendas', []):
            cursor.execute('''
                INSERT INTO encomendas (id, data_encomenda, quantidade, cliente, status)
                VALUES (?, ?, ?, ?, "pendente")
            ''', (
                encomenda['id'],
                encomenda['data'],
                encomenda['quantidade'],
                encomenda['cliente']
            ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'status': 'success', 'message': 'Dados salvos com sucesso!'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/status', methods=['GET'])
def status():
    """Verifica se o servidor está online"""
    return jsonify({
        'status': 'online',
        'timestamp': datetime.now().isoformat(),
        'app': 'Colherada',
        'version': '1.0'
    })

@app.route('/api/reset', methods=['POST'])
def resetar_dados():
    """Reseta todos os dados do dia atual"""
    try:
        data_hoje = datetime.now().strftime('%d/%m/%Y')
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM dados_diarios WHERE data = ?', (data_hoje,))
        cursor.execute('DELETE FROM vendas WHERE data = ?', (data_hoje,))
        
        conn.commit()
        conn.close()
        
        return jsonify({'status': 'success', 'message': 'Dados resetados!'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/estatisticas', methods=['GET'])
def estatisticas():
    """Retorna estatísticas gerais"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) as total FROM vendas')
        total_vendas = cursor.fetchone()['total']
        
        cursor.execute('SELECT COUNT(*) as total FROM encomendas WHERE status = "pendente"')
        total_encomendas = cursor.fetchone()['total']
        
        cursor.execute('SELECT SUM(faturamento_bruto) as total FROM dados_diarios')
        faturamento_total = cursor.fetchone()['total'] or 0
        
        conn.close()
        
        return jsonify({
            'total_vendas': total_vendas,
            'encomendas_pendentes': total_encomendas,
            'faturamento_total': faturamento_total
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🍮 COLHERADA - Sistema de Vendas na Nuvem")
    print("=" * 60)
    
    # Inicializar banco de dados
    init_db()
    
    # Iniciar thread de limpeza periódica
    thread_limpeza = threading.Thread(target=tarefa_limpeza_periodica, daemon=True)
    thread_limpeza.start()
    
    # Obter porta do ambiente (necessário para Render)
    port = int(os.environ.get('PORT', 10000))
    
    print(f"\n✅ Servidor rodando na porta {port}")
    print("🌐 Acesse de qualquer lugar com sincronização automática!")
    print("=" * 60)
    print("\n")
    
    # Iniciar servidor
    app.run(host='0.0.0.0', port=port, debug=False)
