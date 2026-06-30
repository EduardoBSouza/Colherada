#!/usr/bin/env python3
import requests
import time

print("\n🔍 Teste simples\n")

time.sleep(2)  # Aguardar servidor estar pronto

try:
    print("1. Testando página inicial...")
    resp = requests.get("http://localhost:5000/", timeout=10)
    print(f"   Status: {resp.status_code}")
    print(f"   OK: {resp.status_code == 200}")
    
    time.sleep(1)
    
    print("\n2. Testando dashboard.html...")
    resp = requests.get("http://localhost:5000/dashboard.html", timeout=10)
    print(f"   Status: {resp.status_code}")
    if resp.status_code == 200:
        print(f"   ✅ FUNCIONOU! Tamanho: {len(resp.content)} bytes")
    else:
        print(f"   ❌ Erro: {resp.text[:100]}")
    
except Exception as e:
    print(f"   ❌ Erro: {e}")

print()
