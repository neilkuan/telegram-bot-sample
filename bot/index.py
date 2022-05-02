import logging
import os
from pycoingecko import CoinGeckoAPI
import telebot
from typing import Dict

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# import json
API_KEY = os.getenv('API_KEY')

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
    cg = CoinGeckoAPI()
    gmt = cg.get_price(ids='STEPN', vs_currencies=['usd','twd'])
    gst = cg.get_price(ids='green-satoshi-token', vs_currencies=['usd','twd'])
    sol = cg.get_price(ids='solana', vs_currencies=['usd','twd'])
    bot.send_message(message.chat.id, f'''
🐻 Now Price 📊
🏃🏻 GST: 🇺🇸 美金：{now_prices(gst).get('usd')} / 🇹🇼 台幣：{now_prices(gst).get('twd')} 
🐥 GMT: 🇺🇸 美金：{now_prices(gmt).get('usd')} / 🇹🇼 台幣：{now_prices(gmt).get('twd')} 
🔮 SOL: 🇺🇸 美金：{now_prices(sol).get('usd')} / 🇹🇼 台幣：{now_prices(sol).get('twd')} ''')

@bot.message_handler(commands=['mint'])
def mint_shoses(message: telebot.types.Message):
    cg = CoinGeckoAPI()
    gmt = cg.get_price(ids='STEPN', vs_currencies=['usd','twd'])
    gst = cg.get_price(ids='green-satoshi-token', vs_currencies=['usd','twd'])
    sol = cg.get_price(ids='solana', vs_currencies=['usd','twd'])
    try: 
       # numbers format = '/mint 50(gst)/50(gmt)' => ['/mint', '50/50']
        numbers = message.text.split(' ')
        mint_numbers = numbers[1].split('/')

        bot.send_message(message.chat.id, f'''
🤑 🤑 🤑 Mint 新鞋子你需要多少成本 !!! 💸 💸 💸
GST: {mint_numbers[0]}
GMT: {mint_numbers[1]}
此次所需要的成本 💸
🇹🇼 台幣為： {float(mint_numbers[0]) * float(now_prices(gmt).get('twd')) + float(mint_numbers[1]) * float(now_prices(gst).get('twd'))} 元
🇺🇸 美金為： {float(mint_numbers[0]) * float(now_prices(gmt).get('usd')) + float(mint_numbers[1]) * float(now_prices(gst).get('usd'))} 元
🔮 solana: {(float(mint_numbers[0]) * float(now_prices(gmt).get('usd')) + float(mint_numbers[1]) * float(now_prices(gst).get('usd')))/float(now_prices(sol).get('usd'))}
    ''')
    except:
        bot.send_message(message.chat.id, 'Please use this format "/mint 50/50"')

bot.polling()


