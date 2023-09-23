import axios from "axios";
import { JSDOM } from "jsdom";
import fs from "fs";
import * as xpath from 'xpath';

const URL: string = 'https://pisa.ucsc.edu/class_search/index.php';

const COURSE_PARAMETERS = [
    'Career', 
    'Grading', 
    'Class Number', 
    'Type', 
    'Instruction Mode', 
    'Credits', 
    'General Education', 
    'Status', 'Available Seats', 
    'Enrollment Capacity', 
    'Enrolled', 
    'Wait List Capacity',
    'Wait List Total',
];

const GE_CODES = {
    'A': 'A',
    'C': 'C',
    'C1': 'C1',
    'C2': 'C2',
    'CC': 'CC',
    'E': 'E',
    'ER': 'ER',
    'IH': 'IH',
    'IM': 'IM',
    'IN': 'IN',
    'IS': 'IS',
    'MF': 'MF',
    'PE-E': 'PE-E',
    'PE-H': 'PE-H',
    'PE-T': 'PE-T',
    'PR-C': 'PR-C',
    'PR-E': 'PR-E',
    'PR-S': 'PR-S',
    'Q': 'Q',
    'SI': 'SI',
    'SR': 'SR',
    'TA': 'TA',
    'TH': 'TH',
    'TN': 'TN',
    'TS': 'TS',
    'W': 'W',
    'Any Requirement': 'AnyGE',
  };
  
enum ENUMS {  
    OPEN = 'O', 
    ALL = 'all', 
    EQUAL = '=',
    LESS_THAN_EQUAL = '<=',
    GREATER_THAN_EQUAL = '>=',
    CONTAINS = 'contains',
    BETWEEN = 'between',
    WINTER = '0',
    SPRING = '2',
    SUMMER = '4',
    FALL = '8',
    RESULTS = 'results'
}

let BINDS: SearchParameters = {
    action: 'action',
    term: 'binds[:term]',
    reg_status: 'binds[:reg_status]',
    subject: 'binds[:subject]',
    catalog_nbr_op: 'binds[:catalog_nbr_op]',
    catalog_nbr: 'binds[:catalog_nbr]',
    title: 'binds[:title]',
    instr_name_op: 'binds[:instr_name_op]',
    instructor: 'binds[:instructor]',
    ge: 'binds[:ge]',
    crse_units_op: 'binds[:crse_units_op]',
    crse_units_from: 'binds[:crse_units_from]',
    crse_units_to: 'binds[:crse_units_to]',
    crse_units_exact: 'binds[:crse_units_exact]',
    days: 'binds[:days]',
    times: 'binds[:times]',
    acad_career: 'binds[:acad_career]',
    asynch: 'binds[:asynch]',
    hybrid: 'binds[:hybrid]',
    synch: 'binds[:synch]',
    person: 'binds[:person]',
    per_page: 'rec_dur',
};

interface SearchParameters {
    [key: string]: string,
    action: string,
    term: string,
    reg_status: string,
    subject: string,
    catalog_nbr_op: string,
    catalog_nbr: string,
    title: string,
    instr_name_op: string,
    instructor: string,
    ge: string,
    crse_units_op: string,
    crse_units_from: string,
    crse_units_to: string,
    crse_units_exact: string,
    days: string,
    times: string,
    acad_career: string,
    asynch: string,
    hybrid: string,
    synch: string,
    person: string,
    per_page: string,
};

type Course = {
    [key: string]: string,
    name: string,
    class_number: string,
    instructor: string,
    location: string,
    date_time: string,
    enrolled: string,
    //instruction_mode: string,
    //url: string,
}

let STATUS_CODES: Record<string, string> = {
    'Open': '🟢 ',
    'Wait List': '🟡 ',
    'Closed': '🔴 ',
}

let DEFAULT_PARAMETERS: SearchParameters = {
    action: ENUMS.RESULTS,
    term: '2238',
    reg_status: ENUMS.ALL,
    subject: '',
    catalog_nbr_op: ENUMS.EQUAL,
    catalog_nbr: '',
    title: '',
    instr_name_op: ENUMS.EQUAL,
    instructor: '',
    ge: '',
    crse_units_op: ENUMS.EQUAL,
    crse_units_from: '',
    crse_units_to: '',
    crse_units_exact: '',
    days: '',
    times: '',
    acad_career: '',
    asynch: 'A',
    hybrid: 'H',
    synch: 'S',
    person: 'P',
    per_page: '25',
};

function getElementByXpath(dom: JSDOM, path: string): HTMLElement | null {
    const element = document.evaluate(
      path,
      dom.window.document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue as HTMLElement;
    
    return element;
  }

async function getCoursePageHTML(url: string) {
    return (await axios.get(url)).data;
}

function parametersToPostData(parameters: SearchParameters): Record<string, string> {
    let postData: Record<string, string> = {};
    
    for (const key in parameters) {
        if (key in BINDS) {
          postData[BINDS[key]] = parameters[key];
        }
      }
    return postData
}

async function getCourseInfo(url: string): Promise<Record<string, string>> { // Parse the HTML and get all course stats
    const courseHTML = await getCoursePageHTML(url);
    let courseDOM = new JSDOM(courseHTML);
    let courseInfo: Record<string, string> = {}; // Capture all course parameters

    COURSE_PARAMETERS.forEach(async(parameter: string) => {
        let path: string = `//div[@class="panel-body"]//dl[@class="dl-horizontal"]/dt[contains(text(), "${parameter}")]/following-sibling::dd[1]`;
        
        let element: HTMLElement | null = getElementByXpath(courseDOM, path)
        courseInfo[parameter] = element?.textContent || '';
    });

    return courseInfo;
}

async function getSearchCourseHTML(parameters: SearchParameters, count: number = 25): Promise<string> {
    let postData: Record<string, string> = parametersToPostData(parameters);
    postData['rec_dur'] = count.toString();
    const response = await axios.post(URL, postData, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }});
    return response.data;
}

function writePostDataToFile(fileName: string, postData: Record<string, string>): void {
    fs.writeFileSync(fileName, `<!DOCTYPE html>
        <html>
        
        <head>
        </head>
        
        <script type="text/javascript">
          function submit() { document.getElementById("form").submit() }
        </script>
        
        <body onload="submit()">
        <form method="post" action="https://pisa.ucsc.edu/class_search/index.php" id="form">
        `);

    for (const key in postData) {
        fs.appendFileSync(fileName, `<input name="${key}" value="${postData[key]}" hidden="true">\n`)
    }
    fs.appendFileSync(fileName, `<input type="submit" value="submit" hidden="true"> 
    </form>

    </body>
    </html>`);
}

function getCoursesFromHtml(html: string): Course[] {
    let courses: Course[] = [];
    let dom: JSDOM = new JSDOM(html);
    let course_divs: HTMLCollectionOf<Element> = dom.window.document.getElementsByClassName('panel panel-default row');
    
    for(let div of course_divs) {
        let course: Course = {
            name: div.getElementsByClassName('panel-heading panel-heading-custom')[0].textContent?.trim() ?? '',
            class_number: div.querySelector('[id^="class_nbr"]')?.textContent ?? '',
            instructor: div.getElementsByClassName('fa fa-user')[0].parentElement?.textContent?.split(":").slice(1).join(":").trim().replaceAll(',', ', ') ?? '',
            location: div.getElementsByClassName('fa fa-location-arrow')[0].parentElement?.textContent?.split(":").slice(1).join(":").trim() ?? '',
            date_time: div.getElementsByClassName('fa fa-clock-o')[0].parentElement?.textContent?.split(":").slice(1).join(":").trim() ?? '',
            enrolled: div.getElementsByClassName('col-xs-6 col-sm-3')[2].textContent?.trim() ?? '',
            //instruction_mode: div.getElementsByClassName('col-xs-6')[7].textContent?.split(":").slice(1).join(":").trim() ?? '',
            url: div.querySelector('[id^="class_nbr"]')?.getAttribute('href') ?? '',
        };
        courses.push(course);
    }
    return courses;
}


function yearQuarterToTermCode(quarter: string, year: string = '') {
    if (year === '') {
        year = new Date().getFullYear().toString();
    }
    
    let code: string = year[0] + year.substring(2, 4) + quarter;
    return code;
}

export { getSearchCourseHTML, getCourseInfo, URL, ENUMS, GE_CODES, DEFAULT_PARAMETERS, SearchParameters, Course, STATUS_CODES, getCoursesFromHtml, yearQuarterToTermCode, parametersToPostData, getCoursePageHTML, getElementByXpath};