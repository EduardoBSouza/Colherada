#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Teste de conexão com o servidor"""

import requests
import json

def testar_servidor():
    """Testa a conexão com o servidor"""
    base_url = "http://localhost:5000"
    
    print("\n🔍 TESTANDO SERVIDOR COLHERADA\n")
    print("="*50)
    
    # Teste 1: Página principal
    print("\n1. Testando página principal (/)...")
    try:
        response = requests.get(base_url, timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ Servidor respondendo!")
        else:
            print(f"   ⚠️ Status inesperado: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Erro: {e}")
    
    # Teste 2: Rota de login
    print("\n2. Testando rota de login (/api/login)...")
    try:
        response = requests.post(
            f"{base_url}/api/login",
            json={"usuario": "NNK", "senha": "pudimcolherada"},
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        print(f"   Status: {response.status_code}")
        print(f"   Resposta: {response.text[:200]}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Login funcionando!")
            print(f"   Resposta completa: {json.dumps(data, indent=2)}")
        elif response.status_code == 404:
            print("   ❌ ERRO 404: Rota não encontrada!")
            print("   A rota /api/login não existe no servidor")
        else:
            print(f"   ⚠️ Status: {response.status_code}")
            try:
                print(f"   Detalhes: {response.json()}")
            except:
                print(f"   Resposta: {response.text}")
    except Exception as e:
        print(f"   ❌ Erro: {e}")
    
    # Teste 3: Testar com credenciais erradas
    print("\n3. Testando com senha incorreta...")
    try:
        response = requests.post(
            f"{base_url}/api/login",
            json={"usuario": "NNK", "senha": "senhaerrada"},
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 401:
            print("   ✅ Validação funcionando (rejeita senha errada)")
        else:
            print(f"   Resposta: {response.text[:200]}")
    except Exception as e:
        print(f"   ❌ Erro: {e}")
    
    print("\n" + "="*50)

if __name__ == '__main__':
    testar_servidor()
