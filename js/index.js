let globalCourses;
let globalCoursesTaken;
let globalCoursesEnrolled;
let isLogged = false;
let username = "";
let IconCheckmark = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="green"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.393 7.5l-5.643 5.784-2.644-2.506-1.856 1.858 4.5 4.364 7.5-7.643-1.857-1.857z" /></svg>`;
let IconX = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="red"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 16.538l-4.592-4.548 4.546-4.587-1.416-1.403-4.545 4.589-4.588-4.543-1.405 1.405 4.593 4.552-4.547 4.592 1.405 1.405 4.555-4.596 4.591 4.55 1.403-1.416z"/></svg>`;

// Courses Table
let tbody = document.querySelector("#enrollment-tbody");
// Curriculum Table
let cbody = document.querySelector("#curriculum-tbody");
// Enrollment Table
let ebody = document.querySelector("#hidden-enrollment-tbody");

// Open Side Menu
let currButton = document.querySelector("#side-button-curriculum");
let sideMenu = document.querySelector(".side-menu-hidden");
currButton.addEventListener("click",async ()=>{
    sideMenu.classList.toggle("open");
})

// Close Side Menu
let closeButton = document.querySelector("#close-button");
closeButton.addEventListener("click",async ()=>{
    sideMenu.classList.toggle("open");
})

// Open Enrollment Side Menu
let enroButton = document.querySelector("#side-button-enrollment");
let enroSideMenu = document.querySelector(".hidden-enrollment-view");
enroButton.addEventListener("click",async ()=>{
    enroSideMenu.classList.toggle("open");
})

// Close Enrollment Side Menu
let enroCloseButton = document.querySelector("#enrollment-close-button");
enroCloseButton.addEventListener("click",async ()=>{
    enroSideMenu.classList.toggle("open");
})

// Dropdown Filter
let termDropdown = document.querySelector("#semester-dropdown");
termDropdown.addEventListener("change" , ()=> {
    console.log(globalCoursesEnrolled);
    tbody.innerHTML = transformToTableRows(globalCourses);
})


// Initial Load  
window.addEventListener("load", async ()=>{
        auth()
})

// search input filter for course 
let searchInput = document.querySelector("#search-course-input");
searchInput.addEventListener("keydown", async (e)=>{
    if (e.key === "Enter") {
        const splitted = e.target.value.match(/[a-zA-Z]+|[0-9]+(?:\.[0-9]+)?|\.[0-9]+/g);
        let response = await fetch("/search", {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer', 
            body: JSON.stringify({data: splitted})
        })

        let data = await response.json();

        tbody.innerHTML = transformToTableRows(data);
    }
})


// ################## Functions ##################

function tranformToObject(data) {
    return Object.keys(data).map(function (key) {
        
        // Using Number() to convert key to number type
        // Using obj[key] to retrieve key value
        data[key]['nameid'] = key; 
        return data[key];
    });
}
function findEnrolledCourse(item) {
    const founds = globalCoursesEnrolled.filter(i => i.id == item.nameid)
    let isChecked = false;
    if (founds) {
        isChecked = founds.find(i=> i.term == termDropdown.value);
    }
    return isChecked;
}

function isRequirementMet (item){
    // globalCoursesTaken
    // If does not have requirements its ok to take it
    if (item.prereq.length === 0 && item.coreq.length === 0)
    {
        return true
    }
    let taken = true;
    item.prereq.forEach(item=>{
        if(globalCoursesTaken[item] === false ){
            taken = false;
        }
    })
    item.coreq.forEach(item=>{
        if(globalCoursesTaken[item] === false ){
            taken = false;
        }
    })
    return taken;
}
function transformToTableRows(data) {
    var result = tranformToObject(data);
    let rows = "";
    result.forEach((item)=>{    
        rows += `<tr>
                <td>${item.demand.find(i => i.term == termDropdown.value).quantity}</td>
                <td>${item.nameid}</td>
                <td>${item.description}</td>
                <td>${item.prereq.join(", ")}</td>
                <td>${item.coreq.join(", ")}</td>
                <td>${isRequirementMet(item) ? IconCheckmark: IconX}</td>
                <td> <input type="checkbox" onclick='handleCourseCheckbox(this);' data-id="${item.nameid}" ${ findEnrolledCourse(item) ? "checked":""}> </td>
            </tr>`;
    })
    return rows;
}

async function getCourses(){
    let response = await fetch("/search", {
            method: 'POST', // GET, POST, PUT, DELETE
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow', 
            referrerPolicy: 'no-referrer', 
            body: JSON.stringify({data: []})
        })
        
        let data = await response.json();

        globalCourses = data;
        tbody.innerHTML = transformToTableRows(globalCourses);
}

async function getCurriculum() {
    let response = await fetch("/curriculum", {
        method: 'POST', // *GET, POST, PUT, DELETE
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow', 
        referrerPolicy: 'no-referrer', 
        })
        
        let curriculums = await response.json();
        let ciicCur = curriculums["CIIC"]; 
        let myHTML = "";
        
        ciicCur.courses.forEach((course)=>{
            if (course.ID.length == 8){
                if(globalCourses[course.ID]){
                    myHTML += `<tr>
                    <td>${course.term.year}Y${course.term.semester}S</td>
                    <td>${globalCourses[course.ID].nameid}</td>
                    <td>${globalCourses[course.ID].description}</td>
                    <td>${globalCourses[course.ID].prereq.join(", ")}</td>
                    <td>${globalCourses[course.ID].coreq.join(", ")}</td>
                    <td><input type="checkbox" name="curriculum-cb" data-id="${course.ID}" ${ globalCoursesTaken[course.ID] ? "checked": ""}> </td>
                </tr>`;
                }
            }
            else {
                myHTML += `<tr>
                        <td> --- </td>
                        <td> --- </td>
                        <td>${course.ID} Elective</td>
                        <td> --- </td>
                        <td> --- </td>
                        <td> <input type="checkbox" name="curriculum-cb" data-id="${course.ID}" ${ globalCoursesTaken[course.ID] ? "checked": ""}> </td>
                    </tr>`
            }
        })
        cbody.innerHTML = myHTML;

}

function getEnrollment() {

    let myHTML = "";
    globalCoursesEnrolled.forEach((course) => {
        if (course.id) {
            myHTML += `<tr>
                <td>${globalCourses[course.id].demand.find(i => i.term == termDropdown.value).quantity}</td>
                <td>${globalCourses[course.id].nameid}</td>
                <td>${globalCourses[course.id].description}</td>
                <td>${course.term}</td>
            </tr>`;
        }
    })
    ebody.innerHTML = myHTML;
}

async function getAuthCoursesApproved(){
    let response = await fetch("/getAuthData", {
        method: 'POST', // GET, POST, PUT, DELETE
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow', 
        referrerPolicy: 'no-referrer', 
        body: JSON.stringify({data: []})
        })
        
        let data = await response.json();

        globalCoursesTaken = data.courses; 
}

async function getAuthCoursesEnrolled(){
    let response = await fetch("/getEnrolledClasses", {
        method: 'POST', // GET, POST, PUT, DELETE
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow', 
        referrerPolicy: 'no-referrer', 
        body: JSON.stringify({data: []})
        })
        
        let data = await response.json();

        globalCoursesEnrolled = data; 
}

async function postApproved(courseID, approve){
    await fetch("/postApproved", {
        method: 'POST', // GET, POST, PUT, DELETE
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow', 
        referrerPolicy: 'no-referrer', 
        body: JSON.stringify({data: {id: courseID, approve: approve}})
    })
}

function auth() {
    let LoginForm = document.querySelector("#upr-form-auth");

    LoginForm.addEventListener("submit", async  (e)=>{
        e.preventDefault();

            let data = {
                username:LoginForm.elements["uname"].value,
                password:LoginForm.elements["psw"].value
            }
            
            let response = await fetch("/login", {
                method: 'POST', // GET, POST, PUT, DELETE
                headers: {
                    'Content-Type': 'application/json'
                },
                redirect: 'follow', 
                referrerPolicy: 'no-referrer', 
                body: JSON.stringify({data: data})
            })
    
            let parsedResult = await response.json();
    
            isLogged = parsedResult.loginSuccesful;
            username = parsedResult.username;

            if( !isLogged ) {
                alert("Try again! \n Username or password incorrect!")
            }else {
                LoginSuccess();
            }
       
    })
    // LoginSuccess();

}

async function LoginSuccess() {
    // Remove login 
    document.getElementById("main-login-container").style.display = "none";
    document.getElementById("main-page").style.filter = "none";

    await getAuthCoursesApproved();

    await getAuthCoursesEnrolled();

    await getCourses();

    await getCurriculum();

    getEnrollment();

    let checkboxes = document.getElementsByName("curriculum-cb");

    checkboxes.forEach((checkbox)=>{
        checkbox.addEventListener("change", ()=>{
            console.log(checkbox.dataset.id, checkbox.checked)
            postApproved(checkbox.dataset.id, checkbox.checked)
        })
    })

}

async function handleCourseCheckbox (e){
    // globalCoursesEnrolled
    console.log(e.checked, e.dataset.id)
    e.disabled = true;

    let response = await fetch("/enrollClass", {
        method: 'POST', // GET, POST, PUT, DELETE
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({data: {"enroll": e.checked, "courseid": e.dataset.id, "term":  termDropdown.value}})
    })
    
    
    let data = await response.json();
    console.log(data);

    globalCoursesEnrolled = data.matricula;
    getEnrollment();
    globalCourses = data.courses;
    tbody.innerHTML = transformToTableRows(globalCourses);
    e.disabled = false;
}