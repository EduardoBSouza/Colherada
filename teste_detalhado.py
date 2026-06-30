#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Teste detalhado de rota"""

import requests
import os

print("\n🔍 TESTE DETALHADO\n")
print("="*60)

# Verificar se arquivo existe
arquivo = "dashboard.html"
existe = os.path.exists(f"d:\\Controle de Vendas\\{arquivo}")
print(f"\n1. Arquivo {arquivo} existe? {existe}")

if existe:
    caminho_completo = os.path.abspath(arquivo)
    print(f"   Caminho completo: {caminho_completo}")

# Testar requisição
print(f"\n2. Testando requisição HTTP...")
try:
    response = requests.get(f"http://localhost:5000/{arquivo}", timeout=2)
    print(f"   Status: {response.status_code}")
    print(f"   Content-Type: {response.headers.get('Content-Type')}")
    print(f"   Tamanho da resposta: {len(response.content)} bytes")
    
    if response.status_code == 404:
        print(f"\n   ❌ Resposta 404:")
        print(f"   {response.text[:200]}")
except Exception as e:
    print(f"   ❌ Erro: {e}")

# Testar rota da API
print(f"\n3. Testando rota da API /api/login...")
try:
    response = requests.post(
        "http://localhost:5000/api/login",
        json={"usuario": "teste", "senha": "teste"},
        timeout=2
    )
    print(f"   Status: {response.status_code}")
    print(f"   ✅ API funcionando!")
except Exception as e:
    print(f"   ❌ Erro: {e}")

print("\n" + "="*60 + "\n")
