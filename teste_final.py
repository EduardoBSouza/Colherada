#!/usr/bin/env python3
import requests
import time

print("\n🔍 TESTE FINAL - SERVIDOR SIMPLES\n")
print("="*60)

time.sleep(1)

print("\n1️⃣ Testando página de login (/)...")
try:
    resp = requests.get("http://localhost:5000/", timeout=5)
    if resp.status_code == 200:
        print(f"   ✅ LOGIN PAGE OK (tamanho: {len(resp.content)} bytes)")
    else:
        print(f"   ❌ Status: {resp.status_code}")
except Exception as e:
    print(f"   ❌ Erro: {e}")

time.sleep(0.5)

print("\n2️⃣ Testando API de login...")
try:
    resp = requests.post(
        "http://localhost:5000/api/login",
        json={"usuario": "NNK", "senha": "pudimcolherada"},
        timeout=5
    )
    if resp.status_code == 200:
        data = resp.json()
        print(f"   ✅ API LOGIN OK")
        print(f"   Resposta: {data}")
    else:
        print(f"   ❌ Status: {resp.status_code}")
        print(f"   Resposta: {resp.text}")
except Exception as e:
    print(f"   ❌ Erro: {e}")

time.sleep(0.5)

print("\n3️⃣ Testando dashboard.html...")
try:
    resp = requests.get("http://localhost:5000/dashboard.html", timeout=5)
    if resp.status_code == 200:
        print(f"   ✅ DASHBOARD OK (tamanho: {len(resp.content)} bytes)")
    else:
        print(f"   ❌ Status: {resp.status_code}")
except Exception as e:
    print(f"   ❌ Erro: {e}")

time.sleep(0.5)

print("\n4️⃣ Testando styles/main.css...")
try:
    resp = requests.get("http://localhost:5000/styles/main.css", timeout=5)
    if resp.status_code == 200:
        print(f"   ✅ CSS OK (tamanho: {len(resp.content)} bytes)")
    else:
        print(f"   ❌ Status: {resp.status_code}")
except Exception as e:
    print(f"   ❌ Erro: {e}")

time.sleep(0.5)

print("\n5️⃣ Testando scripts/auth.js...")
try:
    resp = requests.get("http://localhost:5000/scripts/auth.js", timeout=5)
    if resp.status_code == 200:
        print(f"   ✅ JS OK (tamanho: {len(resp.content)} bytes)")
    else:
        print(f"   ❌ Status: {resp.status_code}")
except Exception as e:
    print(f"   ❌ Erro: {e}")

print("\n" + "="*60)
print("\n🎉 SE TUDO DEU ✅ ACIMA:")
print("   1. Abra o navegador")
print("   2. Digite: http://localhost:5000")
print("   3. Faça login: NNK / pudimcolherada")
print("\n" + "="*60 + "\n")
