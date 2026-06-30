#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Script para verificar e corrigir autenticação"""

import sqlite3
import hashlib

def criar_hash_senha(senha):
    """Cria hash SHA256 da senha"""
    return hashlib.sha256(senha.encode()).hexdigest()

def verificar_usuario():
    """Verifica se o usuário NNK existe"""
    conn = sqlite3.connect('colherada.db')
    cursor = conn.cursor()
    
    # Verificar se a tabela existe
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='usuarios'")
    tabela_existe = cursor.fetchone()
    
    if not tabela_existe:
        print("❌ Tabela 'usuarios' não existe!")
        conn.close()
        return False
    
    print("✅ Tabela 'usuarios' existe")
    
    # Verificar se o usuário NNK existe
    cursor.execute("SELECT usuario, senha_hash, nome FROM usuarios WHERE usuario = 'NNK'")
    usuario = cursor.fetchone()
    
    if usuario:
        print(f"✅ Usuário encontrado: {usuario[0]}")
        print(f"   Nome: {usuario[2]}")
        print(f"   Hash armazenado: {usuario[1][:20]}...")
        
        # Testar a senha
        senha_teste = 'pudimcolherada'
        hash_teste = criar_hash_senha(senha_teste)
        print(f"   Hash calculado:  {hash_teste[:20]}...")
        
        if usuario[1] == hash_teste:
            print("✅ SENHA CORRETA! A autenticação deveria funcionar.")
        else:
            print("❌ SENHA INCORRETA! O hash não confere.")
            print(f"   Diferença detectada:")
            print(f"   Armazenado: {usuario[1]}")
            print(f"   Calculado:  {hash_teste}")
    else:
        print("❌ Usuário NNK não encontrado!")
        print("   Criando usuário agora...")
        
        senha_hash = criar_hash_senha('pudimcolherada')
        cursor.execute(
            "INSERT INTO usuarios (usuario, senha_hash, nome) VALUES (?, ?, ?)",
            ('NNK', senha_hash, 'Colherada')
        )
        conn.commit()
        print("✅ Usuário NNK criado com sucesso!")
        print(f"   Usuário: NNK")
        print(f"   Senha: pudimcolherada")
    
    conn.close()
    return True

if __name__ == '__main__':
    print("\n🔍 VERIFICAÇÃO DE AUTENTICAÇÃO - COLHERADA\n")
    verificar_usuario()
    print("\n" + "="*50)
    print("CREDENCIAIS:")
    print("  Usuário: NNK")
    print("  Senha: pudimcolherada")
    print("="*50 + "\n")
