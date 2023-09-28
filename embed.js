const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

await lib.discord.channels['@0.3.2'].messages.create({
  "channel_id": `${context.params.event.channel_id}`,
  "content": "",
  "tts": false,
  "components": [
    {
      "type": 1,
      "components": [
        {
          "style": 3,
          "label": `<`,
          "custom_id": `previous`,
          "disabled": false,
          "type": 2
        },
        {
          "style": 1,
          "label": `1`,
          "custom_id": `row_0_button_2`,
          "disabled": false,
          "type": 2
        },
        {
          "style": 2,
          "label": `2`,
          "custom_id": `row_0_button_3`,
          "disabled": false,
          "type": 2
        },
        {
          "style": 2,
          "label": `3`,
          "custom_id": `row_0_button_4`,
          "disabled": false,
          "type": 2
        },
        {
          "style": 3,
          "label": `>`,
          "custom_id": `row_0_button_5`,
          "disabled": false,
          "type": 2
        }
      ]
    }
  ],
  "embeds": [
    {
      "type": "rich",
      "title": `🟢 CSE 101 - 01: Introduction to Data Structures and Algorithms`,
      "description": `Description: Introduction to abstract data types and basics of algorithms. Linked lists, stacks, queues, hash tables, trees, heaps, and graphs will be covered. Students will also be taught how to derive big-Oh analysis of simple algorithms. All assignments will be in C/C++. (Formerly Computer Science 101 Algorithms and Abstract Data Types.)`,
      "color": 0x02f502,
      "fields": [
        {
          "name": `Career`,
          "value": `Undergraduate`,
          "inline": true
        },
        {
          "name": `Grading`,
          "value": `Student Option`,
          "inline": true
        },
        {
          "name": `Class Number`,
          "value": `1115O`,
          "inline": true
        },
        {
          "name": `Type`,
          "value": `Lecture`,
          "inline": true
        },
        {
          "name": `Instruction Mode\n`,
          "value": `In Person\n`,
          "inline": true
        },
        {
          "name": `Credits`,
          "value": `5 units\n`,
          "inline": true
        },
        {
          "name": `General Education\n`,
          "value": `None`,
          "inline": true
        },
        {
          "name": `Status`,
          "value": `Wait List`,
          "inline": true
        },
        {
          "name": `Available Seats\n`,
          "value": `O`,
          "inline": true
        },
        {
          "name": `Enrollment Capacity`,
          "value": `25O`,
          "inline": true
        },
        {
          "name": `Enrolled`,
          "value": `25O`,
          "inline": true
        },
        {
          "name": `Wait List Capacity\n`,
          "value": `1OOO`,
          "inline": true
        },
        {
          "name": `Wait List Total\n`,
          "value": `6O`,
          "inline": true
        },
        {
          "name": `Enrollment Requirements\n`,
          "value": `Prerequisite(s): CSE 12 or BME 160; CSE 13E or ECE 13 or CSE 13S; and CSE 16; and CSE 30; and MATH 11B or MATH 19B or MATH 20B or AM 11B.\n`
        },
        {
          "name": `Class Notes\n`,
          "value": `Enrollment restricted to Computer Science, Computer Engineering, Computer Game Design, Network and Digital Technology, Bioinformatics, Biomolecular Engineering and Bioinformatics, and Robotics Engineering majors and Computer Science proposed majors during First Pass enrollment. Enrollment restricted to Computer Science, Computer Engineering, Computer Game Design, Bioinformatics, Biomolecular Engineering and Bioinformatics, Robotics, Technology and Information Management majors, minors and proposed majors during Second Pass enrollment. Major restrictions lifted after Second Pass enrollment appointments.\n`
        },
        {
          "name": `Meeting Information`,
          "value": "\u200B"
        },
        {
          "name": `Days & Times\t`,
          "value": `TuTh 05:20PM-06:55PM\t`,
          "inline": true
        },
        {
          "name": `Room`,
          "value": `Earth&Marine B206\t`,
          "inline": true
        },
        {
          "name": `Instructor`,
          "value": `Tantalo,P.\t`,
          "inline": true
        },
        {
          "name": `Meeting Dates\n`,
          "value": `09/28/23 - 12/08/23\n`,
          "inline": true
        },
        {
          "name": `#11976 LBS 01A`,
          "value": `Enrl: 33 / 33          Wait: 9/ 999          Closed with Wait List `
        },
        {
          "name": `#11983 LBS 01B`,
          "value": `Enrl: 33 / 33          Wait: 27 / 999          Closed with Wait List`
        }
      ],
      "footer": {
        "text": `Created by user ch4xm`
      },
      "url": `https://pisa.ucsc.edu/cs9/prd/sr9_2013/index.php?action=detail&class_data=YToyOntzOjU6IjpTVFJNIjtzOjQ6IjIyMzgiO3M6MTA6IjpDTEFTU19OQlIiO3M6NToiMTExNTkiO30%3D`
    }
  ]
});