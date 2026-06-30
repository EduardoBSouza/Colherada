#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Teste completo das rotas"""

import requests

def testar_rotas():
    """Testa todas as rotas do servidor"""
    base_url = "http://localhost:5000"
    
    print("\n🔍 TESTANDO TODAS AS ROTAS\n")
    print("="*60)
    
    rotas_teste = [
        ('/', 'Página de login'),
        ('/dashboard.html', 'Dashboard'),
        ('/vendas.html', 'Vendas'),
        ('/estoque.html', 'Estoque'),
        ('/encomendas.html', 'Encomendas'),
        ('/financeiro.html', 'Financeiro'),
        ('/receitas.html', 'Receitas'),
        ('/relatorios.html', 'Relatórios'),
        ('/styles/main.css', 'CSS principal'),
        ('/scripts/auth.js', 'JavaScript auth'),
        ('/scripts/api.js', 'JavaScript API'),
    ]
    
    print("\n📄 TESTANDO PÁGINAS E ARQUIVOS ESTÁTICOS:\n")
    
    sucessos = 0
    erros = 0
    
    for rota, descricao in rotas_teste:
        try:
            response = requests.get(f"{base_url}{rota}", timeout=2)
            if response.status_code == 200:
                print(f"   ✅ {descricao:30} → {rota}")
                sucessos += 1
            else:
                print(f"   ❌ {descricao:30} → Status {response.status_code}")
                erros += 1
        except Exception as e:
            print(f"   ❌ {descricao:30} → Erro: {e}")
            erros += 1
    
    print("\n" + "="*60)
    print(f"\n📊 RESULTADO: {sucessos} sucessos, {erros} erros\n")
    
    if erros == 0:
        print("🎉 TUDO FUNCIONANDO PERFEITAMENTE!")
        print("\n✨ AGORA VOCÊ PODE:")
        print("   1. Abrir o navegador")
        print("   2. Digitar: http://localhost:5000")
        print("   3. Fazer login: NNK / pudimcolherada")
        print("   4. Usar o sistema! 🚀")
    else:
        print("⚠️ Alguns arquivos não foram encontrados")
        print("   Verifique se todos os arquivos existem")
    
    print("\n" + "="*60)

if __name__ == '__main__':
    testar_rotas()
