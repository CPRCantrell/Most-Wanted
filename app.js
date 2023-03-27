var peopleList

function app(people) {
    peopleList = people
    displayWelcome();
    runSearchAndMenu(people);
    return exitOrRestart(people);
}

function displayWelcome() {
    alert('Hello and welcome to the Most Wanted search application!');
}

function runSearchAndMenu(people) {
    const searchResults = searchPeopleDataSet(people);

    if (searchResults.length > 1) {
        displayPeople('Search Results', searchResults);
    }
    else if (searchResults.length === 1) {
        const person = searchResults[0];
        mainMenu(person, people);
    }
    else {
        alert('No one was found in the search.');
    }
}

function searchPeopleDataSet(people) {

    const searchTypeChoice = validatedPrompt(
        'Please enter in what type of search you would like to perform.',
        ['id', 'name', 'traits']
    );

    let results = [];
    switch (searchTypeChoice) {
        case 'id':
            results = searchById(people);
            break;
        case 'name':
            results = searchByName(people);
            break;
        case 'traits':
            results = searchByTraits(people, ["gender","date of birth","height","weight","eyeColor","occupation", "done", "restart"]);
            break;
        default:
            return searchPeopleDataSet(people);
    }

    return results;
}

function searchById(people) {
    const idToSearchForString = prompt('Please enter the id of the person you are searching for.');
    const idToSearchForInt = parseInt(idToSearchForString);
    const idFilterResults = people.filter(person => person.id === idToSearchForInt);
    return idFilterResults;
}

function searchByName(people) {
    const firstNameToSearchFor = prompt('Please enter the the first name of the person you are searching for.');
    const lastNameToSearchFor = prompt('Please enter the the last name of the person you are searching for.');
    const fullNameSearchResults = people.filter(person => (person.firstName.toLowerCase() === firstNameToSearchFor.toLowerCase() && person.lastName.toLowerCase() === lastNameToSearchFor.toLowerCase()));
    return fullNameSearchResults;
}

function searchByTraits(people, acceptableAnswers){
    let userAns=validatedPrompt(`Current list contains: ${people.length}\nWhat trait do you want to filter by?`,acceptableAnswers)

    if(userAns == "done"){
        return people
    }else if(userAns == "restart"){
        return searchByTraits(peopleList,["gender","date of birth","height","weight","eyeColor","occupation", "done", "restart"])
    }else{
        switch(userAns){
            case "eyecolor":
                userAns="eyeColor"
                break
            case "date of birth":
                userAns="dob"
                break
            default:
                break
        }

        let options=people.map(person=>person[userAns]).filter(function(value,index,filterMappedArray){return filterMappedArray.indexOf(value) === index})
        let userSelect=validatedPrompt("What filter do you want?",options)

        delete acceptableAnswers[acceptableAnswers.indexOf(userAns)]
        return searchByTraits(people.filter(person=>person[userAns]==userSelect), acceptableAnswers)
    }
}

function mainMenu(person, people) {

    const mainMenuUserActionChoice = validatedPrompt(
        `Person: ${person.firstName} ${person.lastName}\n\nDo you want to know their full information, family, or descendants?`,
        ['info', 'family', 'descendants', 'quit']
    );

    switch (mainMenuUserActionChoice) {
        case "info":
            displayPersonInfo(person);
            break;
        case "family":
            displayPeople('Family', findPersonFamily(person, people));
            break;
        case "descendants":
            displayPeople('Descendants', findPersonDescendants(person, people));
            break;
        case "quit":
            return;
        default:
            alert('Invalid input. Please try again.');
    }

    return mainMenu(person, people);
}

function displayPersonInfo(person){
    let personInfo = `Name: ${person.firstName} ${person.lastName}\nGender: ${person.gender}\nDate of Birth: ${person.dob}\nHeight: ${person.height}\nWeight: ${person.weight}\nEye Color: ${person.eyeColor}\nOccupation: ${person.occupation}`
    alert(personInfo)
}


function findPersonFamily(searchedPerson, people){
    let family=people.filter(person=>{
        if(searchedPerson.currentSpouse==person.id){
            person.relationship = "Spouse"
            return true
        }
        else if(person.parents.includes(searchedPerson.id)){
            person.relationship = "Child"
            return true
        }
        else if(searchedPerson.parents.includes(person.id)){
            person.relationship = "Parent"
            return true
        } else if(searchedPerson.parents.length>0){
            for(let parent in searchedPerson.parents){
                for(let matchParent in person.parents){
                    if(searchedPerson.parents[parent] == person.parents[matchParent] && searchedPerson.id != person.id){
                        person.relationship = "siblings"
                        return true
                    }
                }
            }
        }
    })
    return family
}

function findPersonDescendants(searchedPerson, people){
    let laterDescendants=[]
    let descendants = people.filter(person => {
        if(person.parents.includes(searchedPerson.id)){
            person.relationship="child"
            laterDescendants=findPersonDescendants(person,people)
            return true
        }})

    if(laterDescendants.length>0){
        for(person in laterDescendants){
            laterDescendants[person].relationship="Grand"+laterDescendants[person].relationship
        }
        descendants=descendants.concat(laterDescendants)
    }

    return descendants
}

function displayPeople(displayTitle, peopleToDisplay) {
    let formatedPeopleDisplayText
    if(peopleToDisplay.length == 0){
        formatedPeopleDisplayText = "None"
    }
    else if(peopleToDisplay[0].hasOwnProperty("relationship")){
        formatedPeopleDisplayText = peopleToDisplay.map(person => `${person.relationship}: ${person.firstName} ${person.lastName}`).join('\n');
    }else{
        formatedPeopleDisplayText = peopleToDisplay.map(person => `${person.firstName} ${person.lastName}`).join('\n');
    }
    alert(`${displayTitle}\n\n${formatedPeopleDisplayText}`);
}

function validatedPrompt(message, acceptableAnswers) {
    acceptableAnswers = acceptableAnswers.map(aa => {
        if(typeof aa == "string"){
            return aa.toLowerCase()
        }else{
            return aa
        }
    });

    const builtPromptWithAcceptableAnswers = `${message} \nAcceptable Answers: ${acceptableAnswers.map(aa => `\n-> ${aa}`).join('')}`;

    const userResponse = prompt(builtPromptWithAcceptableAnswers).toLowerCase();
    let selectedAnswer = acceptableAnswers.filter(aa => userResponse == aa)

    if (selectedAnswer.length == 1) {
        return selectedAnswer[0];
    }
    else {
        alert(`"${userResponse}" is not an acceptable response. The acceptable responses include:\n${acceptableAnswers.map(aa => `\n-> ${aa}`).join('')} \n\nPlease try again.`);
        return validatedPrompt(message, acceptableAnswers);
    }
}

function exitOrRestart(people) {
    const userExitOrRestartChoice = validatedPrompt(
        'Would you like to exit or restart?',
        ['exit', 'restart']
    );

    switch (userExitOrRestartChoice) {
        case 'exit':
            return;
        case 'restart':
            return app(people);
        default:
            alert('Invalid input. Please try again.');
            return exitOrRestart(people);
    }
}