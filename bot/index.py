import logging
import os
from pycoingecko import CoinGeckoAPI
import telebot
import requests
from typing import Dict

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# import json
API_KEY = os.getenv('API_KEY')

### 
bsc_scan = {
    'GST_BSC': '0x4a2c860cEC6471b9F5F5a336eB4F38bb21683c98',
    'GMT_BSC': '0x3019BF2a2eF8040C242C9a4c5c4BD4C81678b2A1'
}

# help function
def get_name(message: telebot.types.Message):
    name = ''
    try:
        if message.chat.last_name != None:
            name = message.chat.last_name
        elif message.chat.first_name != None:
            name = message.chat.first_name
        else:
            name = message.chat.username
    except:
        name = ''
    return name

def now_prices(token: Dict):
    for k in token.keys():
       key_name = k
    return {'usd': token.get(key_name).get('usd'), 'twd': token.get(key_name).get('twd'),}


def pancakeswap_api(contract_address: str):
    try:
        data = requests.get(f'https://api.pancakeswap.info/api/v2/tokens/{contract_address}').json()
        price = {'usd': data.get('data').get('price')[:8], 'bnb': data.get('data').get('price_BNB')[:8]}
        return price
    except:
        return 'pancakeswap api error'

logging.info('Start the telegram bot...')
bot = telebot.TeleBot(API_KEY)

@bot.message_handler(content_types=['document', 'audio', 'sticker'])
def handle_docs_audio(message):
	pass

@bot.message_handler(commands=['n_hello', 'n_help'])
def hello(message: telebot.types.Message):
    bot.send_message(message.chat.id, f'Hello! @{get_name(message)}')


@bot.message_handler(commands=['n_price'])
def price(message: telebot.types.Message):
    try:
        cg = CoinGeckoAPI()
        gmt = cg.get_price(ids='STEPN', vs_currencies=['usd','twd'])
        gst = cg.get_price(ids='green-satoshi-token', vs_currencies=['usd','twd'])
        sol = cg.get_price(ids='solana', vs_currencies=['usd','twd'])
        bnb = cg.get_price(ids='binancecoin', vs_currencies=['usd','twd'])
        # gst_bsc = pancakeswap_api(bsc_scan.get('GST_BSC'))
        gst_bsc = cg.get_price(ids='green-satoshi-token-bsc', vs_currencies=['usd','twd'])
        
        bot.send_message(message.chat.id, f'''
🐻 Now Price 📊
🏃🏻 GST_SPL: 🇺🇸 USD: {now_prices(gst).get('usd')} / 🇹🇼 TWD: {now_prices(gst).get('twd')} 
🐥 GMT: 🇺🇸 USD: {now_prices(gmt).get('usd')} / 🇹🇼 TWD: {now_prices(gmt).get('twd')} 
🔮 SOL: 🇺🇸 USD: {now_prices(sol).get('usd')} / 🇹🇼 TWD: {now_prices(sol).get('twd')} 
🟡 BNB: 🇺🇸 USD: {now_prices(bnb).get('usd')} / 🇹🇼 TWD: {now_prices(bnb).get('twd')}

🏃🏻 GST_SPL: 🇺🇸 USD: {now_prices(gst_bsc).get('usd')} / 🇹🇼 TWD: {now_prices(gst_bsc).get('twd')} ''')
    except:
        bot.send_message(message.chat.id, 'CoinGeckoAPI Error')

# The cost of mint shoes in SPL.
@bot.message_handler(commands=['s_mint'])
def mint_shoses(message: telebot.types.Message):
    try:
        cg = CoinGeckoAPI()
        gmt = cg.get_price(ids='STEPN', vs_currencies=['usd','twd'])
        gst = cg.get_price(ids='green-satoshi-token', vs_currencies=['usd','twd'])
        sol = cg.get_price(ids='solana', vs_currencies=['usd','twd']) 

       # numbers format = '/s_mint 50(gst)/50(gmt)' => ['/s_mint', '50/50']
        numbers = message.text.split(' ')
        mint_numbers = numbers[1].split('/')

        bot.send_message(message.chat.id, f'''
🤑 🤑 🤑 Mint 新鞋子你需要多少成本 (SPL)!!! 💸 💸 💸
GST: {mint_numbers[0]}
GMT: {mint_numbers[1]}
此次所需要的成本 💸
🇹🇼 台幣為： {float(mint_numbers[0]) * float(now_prices(gst).get('twd')) + float(mint_numbers[1]) * float(now_prices(gmt).get('twd'))} 元
🇺🇸 美金為： {float(mint_numbers[0]) * float(now_prices(gst).get('usd')) + float(mint_numbers[1]) * float(now_prices(gmt).get('usd'))} 元
🔮 solana: {(float(mint_numbers[0]) * float(now_prices(gst).get('usd')) + float(mint_numbers[1]) * float(now_prices(gmt).get('usd')))/float(now_prices(sol).get('usd'))}
    ''')
    except:
        bot.send_message(message.chat.id, 'Please use this format "/s_mint 50/50"')

# The cost of mint shoes in BSC.
@bot.message_handler(commands=['b_mint'])
def mint_shoses(message: telebot.types.Message):
    try:
        gmt_bsc = pancakeswap_api(bsc_scan.get('GMT_BSC'))        
        gst_bsc = pancakeswap_api(bsc_scan.get('GST_BSC'))

       # numbers format = '/b_mint 50(gst)/50(gmt)' => ['/b_mint', '50/50']
        numbers = message.text.split(' ')
        mint_numbers = numbers[1].split('/')

        bot.send_message(message.chat.id, f'''
🤑 🤑 🤑 Mint 新鞋子你需要多少成本 (BSC)!!! 💸 💸 💸
GST: {mint_numbers[0]}
GMT: {mint_numbers[1]}
此次所需要的成本 💸

🇺🇸 美金為： {float(mint_numbers[0]) * float(gst_bsc.get('usd')) + float(mint_numbers[1]) * float(gmt_bsc.get('usd'))} 元
🟡 BNB: {float(float(mint_numbers[0]) * float(gst_bsc.get('bnb')) + float(mint_numbers[1]) * float(gmt_bsc.get('bnb')))}
    ''')
    except:
        bot.send_message(message.chat.id, 'Please use this format "/b_mint 50/50"')
# 🇹🇼 台幣為： {float(mint_numbers[0]) * float(now_prices(gmt_bsc).get('twd')) + float(mint_numbers[1]) * float(now_prices(gst_bsc).get('twd'))} 元

# Compare the price of GST/SPL and GST/BSC.
@bot.message_handler(commands=['c_gst'])
def price(message: telebot.types.Message):
    try:
        cg = CoinGeckoAPI()
        gst_sol = cg.get_price(ids='green-satoshi-token', vs_currencies=['usd','twd'])
        gst_bsc = cg.get_price(ids='green-satoshi-token-bsc', vs_currencies=['usd','twd'])

        # numbers format = '/c_gst 50(GST/SPL)/50(GST/BSC)' => ['/c_gst', '50/50']
        numbers = message.text.split(' ')
        coins_list = numbers[1].split('/')
        
        bot.send_message(message.chat.id, f'''
🐻 GST Now Price 📊
🏃🏻🔮 GST_SPL: 🇺🇸 USD: {now_prices(gst_sol).get('usd')} / 🇹🇼 TWD: {now_prices(gst_sol).get('twd')} 
🏃🏻🟡 GST_BSC: 🇺🇸 USD: {now_prices(gst_sol).get('usd')} / 🇹🇼 TWD: {now_prices(gst_bsc).get('twd')}

GST_SPL: {coins_list[0]}
GST_BSC: {coins_list[1]}

GST/SPL: {float(coins_list[0])*float(now_prices(gst_sol).get('usd'))} USD
GST/BSC: {float(coins_list[1])*float(gst_bsc.get('usd'))} USD
''')

    except:
        bot.send_message(message.chat.id, 'Please use this format "/c_gst, 50/50"')

# List the price of GST/SPL and GST/BSC.
@bot.message_handler(commands=['gst'])
def price(message: telebot.types.Message):
    try:
        cg = CoinGeckoAPI()
        gst_sol = cg.get_price(ids='green-satoshi-token', vs_currencies=['usd','twd'])
        # gst_bsc = pancakeswap_api(bsc_scan.get('GST_BSC'))
        gst_bsc = cg.get_price(ids='green-satoshi-token-bsc', vs_currencies=['usd','twd'])
        
        bot.send_message(message.chat.id, f'''
🐻 GST Now Price 📊
🏃🏻🔮 GST_SPL: 🇺🇸 USD: {now_prices(gst_sol).get('usd')} / 🇹🇼 TWD: {now_prices(gst_sol).get('twd')} 
🏃🏻🟡 GST_BSC: 🇺🇸 USD: {now_prices(gst_bsc).get('usd')} / 🇹🇼 TWD: {now_prices(gst_bsc).get('twd')}
🟡/🔮 兩者相差倍率: {float(now_prices(gst_bsc).get('usd'))/float(now_prices(gst_sol).get('usd'))}
''')
    except:
        bot.send_message(message.chat.id, 'CoinGeckoAPI Error')

bot.polling()


