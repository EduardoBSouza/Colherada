#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Módulo de Banco de Dados - Suporta JSON (local) e PostgreSQL (produção)
"""

import os
import json
from datetime import datetime

# Verificar se está em produção (Render)
DATABASE_URL = os.environ.get('DATABASE_URL')
USE_POSTGRES = DATABASE_URL is not None

if USE_POSTGRES:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    # Render usa postgres:// mas psycopg2 precisa de postgresql://
    if DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

# Arquivo JSON local
DADOS_FILE = 'dados_pdv.json'

def inicializar_dados():
    """Estrutura de dados padrão"""
    return {
        'estoque': {
            '80g': 0,
            '150g': 0,
            '500g': 0
        },
        'faturamento_bruto': 0,
        'lucro_liquido': 0,
        'vendas': [],
        'encomendas': [],
        'data': datetime.now().strftime('%d/%m/%Y'),
        'receita': {
            'titulo': '',
            'conteudo': '',
            'atualizado_em': ''
        }
    }

def get_connection():
    """Obtém conexão com o banco PostgreSQL"""
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def init_database():
    """Inicializa banco de dados PostgreSQL"""
    if not USE_POSTGRES:
        return
    
    conn = get_connection()
    cur = conn.cursor()
    
    # Criar tabela de dados se não existir
    cur.execute('''
        CREATE TABLE IF NOT EXISTS dados_pdv (
            id INTEGER PRIMARY KEY DEFAULT 1,
            dados JSONB NOT NULL,
            atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Inserir dados iniciais se não existirem
    cur.execute('SELECT COUNT(*) as count FROM dados_pdv WHERE id = 1')
    result = cur.fetchone()
    
    if result['count'] == 0:
        dados_iniciais = inicializar_dados()
        cur.execute(
            'INSERT INTO dados_pdv (id, dados) VALUES (1, %s)',
            (json.dumps(dados_iniciais),)
        )
    
    conn.commit()
    cur.close()
    conn.close()

def carregar_dados():
    """Carrega dados do JSON ou PostgreSQL"""
    if USE_POSTGRES:
        try:
            conn = get_connection()
            cur = conn.cursor()
            cur.execute('SELECT dados FROM dados_pdv WHERE id = 1')
            result = cur.fetchone()
            cur.close()
            conn.close()
            
            if result:
                return result['dados']
            return inicializar_dados()
        except Exception as e:
            print(f'Erro ao carregar do PostgreSQL: {e}')
            return inicializar_dados()
    else:
        # Modo local com JSON
        if os.path.exists(DADOS_FILE):
            try:
                with open(DADOS_FILE, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return inicializar_dados()
        return inicializar_dados()

def salvar_dados(dados):
    """Salva dados no JSON ou PostgreSQL"""
    if USE_POSTGRES:
        try:
            conn = get_connection()
            cur = conn.cursor()
            cur.execute(
                '''UPDATE dados_pdv 
                   SET dados = %s, atualizado_em = CURRENT_TIMESTAMP 
                   WHERE id = 1''',
                (json.dumps(dados),)
            )
            conn.commit()
            cur.close()
            conn.close()
        except Exception as e:
            print(f'Erro ao salvar no PostgreSQL: {e}')
            raise
    else:
        # Modo local com JSON
        with open(DADOS_FILE, 'w', encoding='utf-8') as f:
            json.dump(dados, f, ensure_ascii=False, indent=2)
