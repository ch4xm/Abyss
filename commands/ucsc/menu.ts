const BASE_URL = "https://nutrition.sa.ucsc.edu/longmenu.aspx?locationNum=";

const LOCATION_NUMS : Record<string,string> = {
    'Cowell/Stevenson': "05",
	'Crown/Merrill': "20",
	'Nine/Ten': "40",
	'Porter/Kresge': "25",
    'Rachel Carson/Oakes': "30",
}
const MEAL_URL = "&mealName=";

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Late Night'];

//-------------------------------------------------------------------------------------------------

const CAFE_URLS : Record<string,string> = {
    'Oakes Cafe': '23',
    'Global Village Cafe': '46',
    'UCen Coffee Bar': '45',
    'Stevenson Coffee House': '26',
    'Porter Market': '50',
    'Perk Coffee Bars': '22',
}

const DIVIDERS = ['-- Soups --', '-- Breakfast --', '-- Grill --', '-- Entrees --', '-- Pizza --', '-- Clean Plate --', '-- DH Baked --', '-- Bakery --', '-- Open Bars --', '-- All Day --', '-- Miscellaneous --', '-- Grab & Go --', '-- Smoothies --', '-- Coffee & Tea Now City of Santa Cruz Cup Fee of $.025 BYO and save up to $0.50 when ordering a togo drink --', '-- Daily --', '-- UCEN COMM --', '-- Bagels --', '-- Commissary --', '-- Brunch --'];
// strings corresponding to the dividers, will be used to determine menu validity
// (eg if cereal is first divider found, then the dh is not open for that meal)

const EMOJIS = { 'veggie': '🥦', 'vegan': '🌱', 'halal': '🍖', 'eggs': '🥚', 'beef': '🐮', 'milk': '🥛', 'fish': '🐟', 'alcohol': '🍷', 'gluten': '🍞', 'soy': '🫘', 'treenut': '🥥', 'sesame': '', 'pork': '🐷', 'shellfish': '🦐', 'nuts': '🥜' };
type restriction = keyof typeof EMOJIS

interface FoodItem {
    restrictions: restriction[],
    price?: string
}

import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';

const JSDOM = require('jsdom').JSDOM;

import fs from 'fs';
import axios from 'axios';

async function get_site_with_cookie(url : string, location_url : string){
    let location_cookie = location_url.slice(0,2);
    const cookies = {
        'WebInaCartLocation': location_cookie,
        'WebInaCartDates': '',
        'WebInaCartMeals': '',
        'WebInaCartQtys': '',
        'WebInaCartRecipes': ''
    };
    console.log(url);
    console.log(location_url);
    return await axios.get(url, { 
        headers: {
            'Cookie': Object.entries(cookies).map(c => c.join('=')).join('; ')
        }
    }).then(response => {
        return response.data;
    }).catch(error => {
    console.error(error);
        return error;
    });
}

async function getMenu(location_url : string, full_url : string) {
    let food_items : Record<string, FoodItem | null> = {};
    let response = await get_site_with_cookie(full_url, location_url);
    const dom = new JSDOM(response);

    dom.window.document.querySelectorAll('div > table > tbody > tr').forEach((tr : any) => {
		if (tr.querySelector('div.longmenucolmenucat')) {
			// If current tr has a divider

            food_items[tr.querySelector('div.longmenucolmenucat').textContent] = null;
			return; // go to next tr
		}
			if (tr.querySelector('div.longmenucoldispname')) {
                let price = tr.querySelector('div.longmenucolprice')?.textContent;
                //console.log('price', price);
                // If current tr has a food item
                let food = tr.querySelector('div.longmenucoldispname').textContent;
                food_items[food] = {
                    restrictions: [],
                    price
                }; // add food to dictionary
                for (let img of tr.querySelectorAll('img')) {
                    // Iterate through dietary restrictions and get img src names
                    let diets = img.getAttribute('src').split('/')[1].split('.')[0];
                    food_items[food]?.restrictions.push(diets);
                }
		    }
  })

  if (!DIVIDERS.includes(Object.keys(food_items)[0])) {
	return null;
  }
  return food_items;
}

async function getDiningHallMenu(dining_hall : string, meal : string, day_offset = 0) {
    const offsetDate = new Date((new Date()).getTime() + day_offset * 60000);
    let date : string = `&dtdate=${offsetDate.getMonth() + 1}%2F${offsetDate.getDate()}%2F${offsetDate.getFullYear().toString().substr(-2)}`;
	let location_url : string = LOCATION_NUMS[dining_hall];
    let full_url : string = BASE_URL + location_url + MEAL_URL + meal + date;

    const food_items = await getMenu(location_url, full_url);
    return food_items;
}

async function getCafeMenu(cafe: string) {
    const today = new Date();
    let date : string = `&dtdate=${today.getMonth() + 1}%2F${today.getDate()}%2F${today.getFullYear().toString().substr(-2)}`;
    let full_url : string = BASE_URL + CAFE_URLS[cafe] //+ date
    const food_items = await getMenu(CAFE_URLS[cafe], full_url);
    return food_items;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('menu')
        .setDescription('Get the menu of the specified day at a dining hall')
        .addSubcommand(subcommand =>
            subcommand
                .setName('cafe')
                .setDescription('Get the menu of one of the UCSC caffes')
                .addStringOption(option =>
                    option.setName('location')
                    .setDescription('Which cafe to get the menu of')
                    .addChoices(...Object.keys(CAFE_URLS).map(name => ({name, value: name})))
                    .setRequired(true)
                )
        ).addSubcommand(subcommand =>
            subcommand
                .setName('dining_hall')
                .setDescription('Get the menu of one of the UCSC dining halls')
                .addStringOption(option =>
                    option.setName('location')
                    .setDescription('Which dining hall to get the menu of')
                    .addChoices(...Object.keys(LOCATION_NUMS).map(name => ({name, value: name})))
                    .setRequired(true))
                .addStringOption(option =>
                    option.setName('meal')
                    .setDescription('Which meal (note that not all meals will be available for every location')
                    .addChoices(...MEALS.map(name => ({name, value: name})))
                    .setRequired(true))
                .addStringOption(option =>
                    option.setName('day_offset')
                    .setDescription('How many days ahead to get the menu from. Default is 0 days (today)')
                    .addChoices(...[...Array(19).keys()].map(num => ({name: String(num), value: String(num)})))
                    .setRequired(false)
                )
        ),

        async execute(interaction : ChatInputCommandInteraction) {
            let foods: string[] = [];
            try {
                foods = fs.readFileSync('menu_items.txt').toString().trim().split("\n"); 
            } catch(error){
                console.log('Error writing to file: ' + error);
            }

            let msg = '';
            const location = interaction.options.getString("location")!;
            let food_items : Record<string, FoodItem | null> | null = null;
            if(interaction.options.getSubcommand() === 'dining_hall') {
                const meal = interaction.options.getString("meal")!;
                food_items = await getDiningHallMenu(location, meal);

            } else if (interaction.options.getSubcommand() === 'cafe') {
                food_items = await getCafeMenu(location);
            }
            let embed = new EmbedBuilder().setTitle(`**Menu for ${location}**`);

            if (food_items == null) {
                embed
                .setColor(0xEE4B2B)
                .setDescription('**Specified meal is not available!**');
                await interaction.reply({ embeds: [embed] });
                return;
            }
            let result : string = '';
            //console.log(food_items);
            for (let food of Object.keys(food_items)) {
                if (food.includes('-- ')) { // if the food has a double dash which signifies its a divider then skip
                    if (food === ('-- Cereal --')){
                        break;
                    }

                    if (result.length != 0) {
                        embed.addFields({name: result, value: msg, inline: false})
                    }
                    
                    result = '**'+food.split('--')[1].trim()+'**';
                    msg = '';
                    //console.log(result, food);
                } else {
                    
                    let food_str = food 
                    if (interaction.options.getSubcommand() === 'cafe') {
                        food_str += ' \t-\t ' + food_items[food]?.price;
                    }
                    if ((food_str.length + msg.length) > 1024) {
                        embed.addFields({name: result, value: msg, inline: false})
                        msg = ''
                        result = '　';
                    }
                    msg += food_str; 
                    //console.log(food, food_items[food]?.price);
                    if (!foods.includes(food)) {
                        console.log(food);
                        foods.push(food);
                    };	
                    for (let diet_restriction of food_items[food]?.restrictions || []) {
                        //msg += ' ' +   EMOJIS[diet_restriction] + ' ';
                    }
                    msg += '\n';
                }        
            }
            
            embed
			.setColor(0x50C878)
            .addFields({name: result, value: msg, inline: true});
			//.setDescription(msg);
            await interaction.reply({ embeds: [embed] });

            /*
            fs.writeFile('menu_items.txt', foods.join('\n').trim() + '\n', function(err) {
                if (err) throw err;
                foods = [];
                //console.log(`Appended foods: \n${foods.join(', ')}\nto the text file.`);
            });
            */

            console.log(`User ${interaction.user.tag} used command ${interaction}`);
        },
}
