import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, AutocompleteInteraction, Colors, ColorResolvable } from 'discord.js';
import * as pisa from '../../pisa';
import { SearchParameters } from '../../pisa';

import fs from 'fs';

type StatusCode = {
    symbol: string,
    color: ColorResolvable,
}

let STATUS_CODES: Record<string, StatusCode> = {
    'Open': 
    {
        'symbol': '🟢 ',
        'color': Colors.Green,
    },
    'Wait List': 
    { 
        'symbol': '🟡 ',
        'color': Colors.Yellow,
    },
    'Closed': {
        'symbol': '🔴 ',
        'color': Colors.Red,
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('course')
        .setDescription('Get information about a course or search for courses using filters')
        .addSubcommand(subcommand =>
            subcommand.setName('search')
            .setDescription('Search for courses using filters')
            .addStringOption(option =>
                option.setName('quarter')
                .setDescription('The quarter to search for courses in')
                .addChoices(
                    { name: "Fall", value: pisa.ENUMS.FALL },
                    { name: "Winter", value: pisa.ENUMS.WINTER },
                    { name: "Spring", value: pisa.ENUMS.SPRING },
                    { name: "Summer", value: pisa.ENUMS.SUMMER })
                .setRequired(true))
            .addStringOption(option =>
                option.setName('year')
                .setDescription('The year to search for courses in')
                .setAutocomplete(true)
                .setRequired(false))
            .addStringOption(option =>
                option.setName('status')
                .setDescription('Whether to show only open or all courses')
                .addChoices( 
                    { name: "All Classes", value: pisa.ENUMS.ALL },
                    { name: "Open Classes", value: pisa.ENUMS.OPEN })
                .setRequired(false))
            .addStringOption(option =>
                option.setName('subject')
                .setDescription('The subject of the course')
                .setAutocomplete(true)
                .setRequired(false))
            .addNumberOption(option =>
                option.setName('number')
                .setDescription('The course number')
                .setRequired(false))
            .addStringOption(option =>
                option.setName('title')
                .setDescription('Filter by course title')
                .setRequired(false))    
            .addStringOption(option =>
                option.setName('instructor')
                .setDescription('Filter by instructor last name')
                .setRequired(false))
            .addStringOption(option =>
                option.setName('gened')
                .setDescription('Filter by general education code')
                .setAutocomplete(true)
                .setRequired(false))
            .addNumberOption(option =>
                option.setName('units')
                .setDescription('Filter by course units')
                .setRequired(false))
            .addBooleanOption(option =>
                option.setName('asynchronous')
                .setDescription('Show asynchronous courses (default true)')
                .setRequired(false))
            .addBooleanOption(option =>
                option.setName('synchronous')
                .setDescription('Show synchronous courses (default true)')
                .setRequired(false))
            .addBooleanOption(option =>
                option.setName('hybrid')
                .setDescription('Show hybrid courses (default true)')
                .setRequired(false))
            .addBooleanOption(option =>
                option.setName('in_person')
                .setDescription('Show online courses (default true)')
                .setRequired(false)))
            .addSubcommand(subcommand =>
                subcommand.setName('info')
                .setDescription('Get information about a specific course')
                .addStringOption(option =>
                    option.setName('quarter')
                    .setDescription('The quarter to search for courses in')
                    .addChoices(
                        { name: "Fall", value: pisa.ENUMS.FALL },
                        { name: "Winter", value: pisa.ENUMS.WINTER },
                        { name: "Spring", value: pisa.ENUMS.SPRING },
                        { name: "Summer", value: pisa.ENUMS.SUMMER })
                    .setRequired(true))
                .addStringOption(option =>
                    option.setName('year')
                    .setDescription('The year to search for courses in')
                    )
                .addStringOption(input =>
                    input.setName('subject')
                    .setDescription('The subject of the course'))),

        async execute(interaction: ChatInputCommandInteraction) {
            if (interaction.options.getSubcommand() === 'search') {
                this.search(interaction);
            }
            if (interaction.options.getSubcommand() === 'info') {
            }
        },

        async autocomplete(interaction: AutocompleteInteraction) {
            if (interaction.options.getSubcommand() === 'search') {
                this.autocompleteSearch(interaction);
            }
        },

        /*
        async autocompleteSearch(interaction: AutocompleteInteraction) {
            let term = interaction.options.getString('term', true) ?? '2238';
            let subjects = {};
            let subjectNames = subjects.map((subject) => {
                return { name: subject.subject, value: subject.subject };
            });
            interaction.reply({ options: subjectNames });
        },*/

        async search(interaction: ChatInputCommandInteraction) {  
            let quarter: string = interaction.options.getString('quarter', true);
            let year: string = interaction.options.getString('year', false) ?? '';
            
            let parameters: SearchParameters = {
                ...pisa.DEFAULT_PARAMETERS,
                term: pisa.yearQuarterToTermCode(quarter, year),
                reg_status: interaction.options.getString('status', false) ?? pisa.ENUMS.ALL,
                subject: interaction.options.getString('subject', false) ?? '',
                catalog_nbr: interaction.options.getNumber('number', false)?.toString() ?? '',
                title: interaction.options.getString('title', false) ?? '',
                instructor: interaction.options.getString('instructor', false) ?? '',
                ge: interaction.options.getString('gened', false) ?? '',
                crse_units_exact: interaction.options.getNumber('units', false)?.toString() ?? '',
                asynch: interaction.options.getBoolean('asynchronous', false) ? 'A' : '',
                synch: interaction.options.getBoolean('synchronous', false) ? 'S' : '',
                hybrid: interaction.options.getBoolean('hybrid', false) ? 'H' : '',
                person: interaction.options.getBoolean('in_person', false) ? 'P' : '',
            }
            
            let html: string = await pisa.getSearchCourseHTML(parameters)
            let courses: pisa.Course[] = pisa.getCoursesFromHtml(html);

            if (courses.length === 0) {
                await interaction.reply({ embeds: [new EmbedBuilder().setTitle('No matching courses found with the given parameters!').setColor(Colors.Red)] });
                return;
            }

            let embeds: EmbedBuilder[] = [];

            for (let course of courses) {
                if (embeds.length >= 10) { // Only allow 10 embeds max
                    break;
                }

                let fields = [];

                //fields.push({ name: 'Class Number', value: course.class_number, inline: true })
                //fields.push({ name: 'Instructor', value: course.instructor ?? 'None', inline: true })
                fields.push({ name: 'Location', value: course.location ?? 'None', inline: true })
                fields.push({ name: 'Date/Time', value: course.date_time ?? 'None', inline: true })
                fields.push({ name: 'Enrolled', value: course.enrolled ?? 'None', inline: true })

                let name: string = course.name;
                let color: ColorResolvable = Colors.White;

                for (let status in STATUS_CODES) {
                    if (name.includes(status)) {
                        name = name.replace(status, STATUS_CODES[status]['symbol']);
                        color = STATUS_CODES[status]['color'];
                    }
                };

                let embed: EmbedBuilder = new EmbedBuilder()
                    .setTitle(name + ' (' + course.class_number + ')\t' + course.instructor)
                    .addFields(fields)
                    .setURL(course.url)
                    .setColor(color);

                embeds.push(embed);
            }

            await interaction.reply({ embeds: embeds });
        }
}