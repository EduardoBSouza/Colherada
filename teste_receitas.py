#!/usr/bin/env python3
import requests
import time

print("\n🧪 TESTANDO ROTA DE RECEITAS\n")
print("="*60)

time.sleep(1)

# Teste 1: Salvar receita
print("\n1️⃣ Testando salvar receita...")
try:
    resp = requests.post(
        "http://localhost:5000/api/salvar_receita",
        json={
            "titulo": "Pudim de Leite Condensado",
            "conteudo": "Ingredientes:\n- 1 leite condensado\n- 2 latas de leite\n- 3 ovos"
        },
        timeout=5
    )
    if resp.status_code == 200:
        data = resp.json()
        print(f"   ✅ Salvar OK")
        print(f"   Resposta: {data}")
    else:
        print(f"   ❌ Status: {resp.status_code}")
        print(f"   Resposta: {resp.text}")
except Exception as e:
    print(f"   ❌ Erro: {e}")

time.sleep(0.5)

# Teste 2: Carregar receita
print("\n2️⃣ Testando carregar receita...")
try:
    resp = requests.get("http://localhost:5000/api/receita", timeout=5)
    if resp.status_code == 200:
        data = resp.json()
        print(f"   ✅ Carregar OK")
        print(f"   Título: {data.get('titulo', 'Vazio')}")
        print(f"   Conteúdo: {data.get('conteudo', 'Vazio')[:50]}...")
    else:
        print(f"   ❌ Status: {resp.status_code}")
except Exception as e:
    print(f"   ❌ Erro: {e}")

print("\n" + "="*60)
print("\n✅ SE TUDO DEU CERTO ACIMA:")
print("   1. Vá no navegador")
print("   2. Pressione Ctrl+Shift+R para recarregar")
print("   3. Vá em Receitas")
print("   4. Tente salvar novamente")
print("\n" + "="*60 + "\n")
