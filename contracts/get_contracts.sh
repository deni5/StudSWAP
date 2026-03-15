#!/bin/bash

# Налаштування
API_KEY="QR4X5M7JHVBQ9XDXFHJIEUVBYUT9TDF4H6"
WALLET_ADDRESS="0xE862Ca4b9389d9bC306c2367A36B8Bd45f6838Bb"

# Виберіть одну з базових URL (розкоментуйте потрібну)
# BASE_URL="https://api.polygonscan.com/api"      # Для Polygon (ID 137)
BASE_URL="https://api-sepolia.etherscan.io/api"  # Для Sepolia

# Перевірка чи встановлено jq
if ! command -v jq &> /dev/null; then
    echo "Помилка: jq не знайдено. Встановіть його: brew install jq"
    exit 1
fi

echo "Шукаю контракти в мережі: $BASE_URL"
echo "Для гаманця: $WALLET_ADDRESS"
echo "------------------------------------------------------------"

# Запит до API
RESPONSE=$(curl -s "$BASE_URL?module=account&action=txlist&address=$WALLET_ADDRESS&startblock=0&endblock=99999999&sort=asc&apikey=$API_KEY")

# Обробка результату
echo "$RESPONSE" | jq -r '.result[] | select(.to == "" or .to == null or .contractAddress != "") | "Дата: \(.timeStamp | tonumber | strftime("%Y-%m-%d %H:%M:%S")) | Контракт: \(.contractAddress) | TX: \(.hash)"' | grep "Контракт: 0x"
