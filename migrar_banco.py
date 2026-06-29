#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Migração - Adicionar coluna de receitas ao banco de dados
Execute este script UMA VEZ para atualizar o banco de dados existente
"""

import sqlite3
import os

DATABASE = 'colherada.db'

def migrar_banco():
    """Adiciona a coluna receitas_anotacoes se ela não existir"""
    try:
        if not os.path.exists(DATABASE):
            print("⚠️ Banco de dados não encontrado. Ele será criado na primeira execução do app.py")
            return
        
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        # Verificar se a coluna já existe
        cursor.execute("PRAGMA table_info(dados_diarios)")
        colunas = [coluna[1] for coluna in cursor.fetchall()]
        
        if 'receitas_anotacoes' in colunas:
            print("✅ Coluna 'receitas_anotacoes' já existe no banco de dados!")
        else:
            print("📝 Adicionando coluna 'receitas_anotacoes'...")
            cursor.execute('''
                ALTER TABLE dados_diarios 
                ADD COLUMN receitas_anotacoes TEXT DEFAULT ''
            ''')
            conn.commit()
            print("✅ Coluna 'receitas_anotacoes' adicionada com sucesso!")
        
        conn.close()
        print("🎉 Migração concluída!")
        
    except Exception as e:
        print(f"❌ Erro na migração: {e}")
        raise

if __name__ == '__main__':
    print("🚀 Iniciando migração do banco de dados...")
    migrar_banco()
