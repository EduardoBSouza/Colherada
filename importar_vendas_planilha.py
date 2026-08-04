#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Importa o histórico de vendas a partir da planilha "Vendas Colherada.xlsx"
e atualiza o sistema Colherada (histórico de vendas, faturamento e lucro).

- O campo "Quantidade" é somado separadamente por "Tamanho" (resumo exibido no console).
- Cada linha da planilha vira um registro no histórico de vendas, usando a
  coluna "Data" da planilha e os respectivos valores (Sabor, Tamanho, Valor, Quantidade).
- Estoque, encomendas e receita cadastrados NÃO são alterados por este script.

Uso:
    python importar_vendas_planilha.py
        -> Atualiza apenas o arquivo local dados_pdv.json

    python importar_vendas_planilha.py --url https://colherada.onrender.com --usuario NNK --senha pudimcolherada
        -> Faz login no site informado e envia os dados atualizados via API
"""

import argparse
import json
import os
from datetime import datetime

import openpyxl
import requests

PLANILHA = 'Vendas Colherada.xlsx'
DADOS_FILE = 'dados_pdv.json'
CUSTO_UNITARIO = 7.00


def ler_planilha(caminho):
    """Lê a planilha e retorna a lista de vendas + resumo de quantidade por tamanho."""
    wb = openpyxl.load_workbook(caminho, data_only=True)
    ws = wb.worksheets[0]

    vendas = []
    resumo_por_tamanho = {}

    for linha in ws.iter_rows(min_row=3, values_only=True):
        data, cliente, sabor, tamanho, valor, quantidade = linha[:6]

        # Ignora a linha de totais (sem data) ou linhas vazias
        if data is None or tamanho is None or quantidade is None:
            continue

        quantidade = int(quantidade)
        valor_total = float(valor) if valor is not None else 0.0
        valor_unitario = round(valor_total / quantidade, 2) if quantidade else 0.0
        sabor = (sabor or '').strip()
        tamanho = str(tamanho).strip()
        cliente = (cliente or '').strip()

        if isinstance(data, datetime):
            data_hora = data.strftime('%Y-%m-%d %H:%M:%S')
            timestamp = data.isoformat()
        else:
            data_hora = str(data)
            timestamp = str(data)

        vendas.append({
            'quantidade': quantidade,
            'tamanho': tamanho,
            'sabor': sabor,
            'cliente': cliente,
            'valor_unitario': valor_unitario,
            'valor_total': valor_total,
            'pagamento': 'Não informado',
            'data_hora': data_hora,
            'timestamp': timestamp,
        })

        resumo_por_tamanho[tamanho] = resumo_por_tamanho.get(tamanho, 0) + quantidade

    return vendas, resumo_por_tamanho


def carregar_dados_locais():
    if os.path.exists(DADOS_FILE):
        with open(DADOS_FILE, 'r', encoding='utf-8-sig') as f:
            return json.load(f)
    return {
        'estoque': {'80g': 0, '150g': 0, '500g': 0, '1kg': 0},
        'faturamento_bruto': 0,
        'lucro_liquido': 0,
        'vendas': [],
        'encomendas': [],
        'data': datetime.now().strftime('%d/%m/%Y'),
        'receita': {'titulo': '', 'conteudo': '', 'atualizado_em': ''},
    }


def montar_dados_atualizados(vendas):
    dados = carregar_dados_locais()

    dados['vendas'] = vendas
    dados['faturamento_bruto'] = round(sum(v['valor_total'] for v in vendas), 2)
    dados['lucro_liquido'] = round(
        sum(v['valor_total'] - v['quantidade'] * CUSTO_UNITARIO for v in vendas), 2
    )
    # estoque, encomendas e receita permanecem como já estavam localmente
    return dados


def salvar_local(dados):
    with open(DADOS_FILE, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)


def enviar_para_servidor(dados, base_url, usuario, senha):
    sessao = requests.Session()

    resp = sessao.post(f'{base_url}/api/login', json={'usuario': usuario, 'senha': senha})
    resp.raise_for_status()
    resultado = resp.json()
    if not resultado.get('success'):
        raise RuntimeError(f'Falha no login: {resultado.get("message")}')

    resp = sessao.post(f'{base_url}/api/dados', json=dados)
    resp.raise_for_status()
    resultado = resp.json()
    if not resultado.get('success'):
        raise RuntimeError(f'Falha ao salvar dados: {resultado.get("message")}')

    print(f'✅ Dados enviados com sucesso para {base_url}')


def main():
    parser = argparse.ArgumentParser(description='Importa vendas da planilha para o Colherada')
    parser.add_argument('--url', help='URL base do site (ex: https://colherada.onrender.com)')
    parser.add_argument('--usuario', default='NNK', help='Usuário de login')
    parser.add_argument('--senha', default='pudimcolherada', help='Senha de login')
    args = parser.parse_args()

    vendas, resumo_por_tamanho = ler_planilha(PLANILHA)

    print(f'📄 {len(vendas)} vendas lidas da planilha "{PLANILHA}"')
    print('\n📊 Quantidade total vendida por tamanho:')
    for tamanho, total in sorted(resumo_por_tamanho.items()):
        print(f'   - {tamanho}: {total} unidades')

    dados_atualizados = montar_dados_atualizados(vendas)

    print(f'\n💰 Faturamento bruto total: R$ {dados_atualizados["faturamento_bruto"]:.2f}')
    print(f'📈 Lucro líquido total: R$ {dados_atualizados["lucro_liquido"]:.2f}')

    salvar_local(dados_atualizados)
    print(f'\n💾 Arquivo local "{DADOS_FILE}" atualizado.')

    if args.url:
        enviar_para_servidor(dados_atualizados, args.url.rstrip('/'), args.usuario, args.senha)
    else:
        print('\nℹ️  Nenhuma URL informada — apenas o arquivo local foi atualizado.')
        print('   Para enviar ao site publicado, rode novamente com:')
        print('   python importar_vendas_planilha.py --url https://SEU-SITE.onrender.com')


if __name__ == '__main__':
    main()
