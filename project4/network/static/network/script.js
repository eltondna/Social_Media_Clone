
// Pagination Counter
let counter = 1;
document.addEventListener("DOMContentLoaded",()=>{
    add_post();
    document.querySelectorAll(".nav-item").forEach(link=>{
        let id = link.id;
        link.onclick = ()=>{
            counter = 1;
            showPage(id,counter); 
        }  
    })
    document.querySelector(".nav-item-user").addEventListener("click", ()=>{
        let id = document.querySelector(".nav-item-user").id;
        showProfile(id,counter);
    })
    showPage("all",counter);
});

// Add Post 
function add_post(){
    document.querySelector(".add_title").value = '';
    document.querySelector(".add_content").value = ''; 
    document.querySelector(".add_post").onsubmit = ()=>{
    let title = document.querySelector(".add_title").value ;
    let content = document.querySelector(".add_content").value;
    fetch('/add',{
        method: 'POST',
        body: JSON.stringify({
            title : `${title}`,
            content: `${content}`,
        })
    })
    .then(response => response.json())
    .then(data=>{
        console.log(data);
        window.location.reload();
    })
    return false;
    };
}


// Show Main Page 
function showPage(section,page){
    if (section == "all"){
        document.querySelector('#profile').style.display = 'none';
        document.querySelector('#post').style.display = 'block';
        document.querySelector('.add_post').style.display = 'block';
        document.querySelector('#post').innerHTML = `<h3 style="margin-left:30px; ">~~ Hot Discussion ~~ </h3><br>`;
        
    }
    else if ( section == 'following' ){
        document.querySelector('#profile').style.display = 'none';
        document.querySelector('#post').style.display = 'block';
        document.querySelector('.add_post').style.display = 'none';
        document.querySelector('#post').innerHTML = `<h3 style="margin-left:30px; "> ~~ ${section.charAt(0).toUpperCase() + section.slice(1)} ~~ </h3><br>`;
    }
// Main Page functionality 
    post_section(section,page);
// Pagination function
    load(section);   
}


// Show Profile of post user 
function showProfile(username,page){
    document.querySelector('#profile').style.display = 'block';
    document.querySelector("#profile").innerHTML="";
    document.querySelector('#post').style.display = 'none';
    document.querySelector('.add_post').style.display = 'none';
    

    const h3 = document.createElement("h3");
    h3.style.marginLeft = "20px";
    h3.style.border = "5px solid white";
    h3.style.borderRadius ="20px";
    h3.style.width = "170px";
    h3.style.padding ="10px";
    h3.innerHTML = `User:&#160&#160&#160${username}`;
    document.querySelector("#profile").append(h3) ;
    const br = document.createElement('br');
    document.querySelector('#profile').append(br);

    load(username);
// Show Following count
    following(username);
                                // Function 1: Follow Button //

// Get request_user 
   request_user = document.querySelector(".nav-item-user").id;

// Check whether request_user == profile_user (Can only follow otehr users)
   if (request_user != username){
    const f_btn = document.createElement("button");
    f_btn.className = "follow";

// Follow Button CSS Styling
    f_btn.style.border=" 0.1cm solid azure";
    f_btn.style.backgroundColor ="transparent";
    f_btn.style.marginLeft = "30px";
    f_btn.style.marginBottom = "50px";
    f_btn.style.width = "100px";
    f_btn.style.height ="40px";
    f_btn.innerHTML ="Follow";

    f_btn.addEventListener('click',()=>{
     fetch("/follow",{
         method: "POST",
         body:JSON.stringify({
             user: `${request_user}`,
             follow_target: `${username}`,
         })
     })
     .then(response => response.json())
     .then(data=>{
        console.log(data);
     })
        return false;
    })
    document.querySelector("#profile").append(f_btn);
   }
// Show User Profile 
   post_section(username,page);
}




// Show all posts 
function post_section(section,page){
    fetch(`/post/${section}/?page=${page}`)
    .then(response => response.json())
    .then(posts => {
            console.log(posts);
            for (i = 0 ;i < posts.length; i++){
                let title = posts[i].title;
                let content = posts[i].content;
                let post_date = posts[i].date;
                let poser = posts[i].Poser;
                let id = posts[i].id;      
                
                const div = document.createElement('div');
                const br = document.createElement('br');
    
    // Post Div Styling //
                div.className = poser;
                div.style.border = "1px solid rgb(255, 255, 255)";
                div.style.height = "260px";
                div.style.marginLeft = "30px";
                div.style.width = "1325px";
                
    // Post Div child elements //
                const h4 = document.createElement('h4');
                const h5 = document.createElement('h5');
                const p = document.createElement('p');
                const like_btn = document.createElement('button');
                const span = document.createElement('span');
                
    // Like btn CSS + Functionality //
                span.innerHTML = posts[i].like;
                span.className = `post_${id}`;
                span.style.fontSize = '20px';
                like_btn.style.border = "none";
                like_btn.style.backgroundColor = "transparent";
                like_btn.style.color = 'red';
                
                // JSON inside JSON
                let like_users = JSON.parse(posts[i].like_user);
                let no = 0;
                if (like_users.length ==0){
                    like_btn.style.color ="red";
                }
                else{
                    for ( h=0; h < like_users.length ;h++ ){
                        if ( like_users[h].fields.username === document.querySelector(".nav-item-user").id){
                            like_btn.style.color = 'black';
                        }
                        else{
                            no++;
                        }
                    }
                    if ( no === like_users.length){
                        like_btn.style.color = 'red';
                    }
                }
                like_btn.style.fontSize = '35px';
                like_btn.innerHTML = "&#10084";
                like_btn.id = id;
                like_btn.addEventListener('click',event=>{
                    let button = event.target;
                    if ( button.style.color ==  "red"){
                        button.style.color = 'black';
                        add_like(button.id);
                    }
                    else{
                        button.style.color ='red';
                        remove_like(button.id);
                    }
                });
                h4.innerHTML = `${poser}:&#160&#160&#160${title}<hr>`;
                h4.className = "post_title";
                h5.innerHTML = `${content}`;
                p.innerHTML = `${post_date}`;
                div.appendChild(h4);
                

    // Inner Original Div for the element (Function: Hide this div when editing)
                const orig_div = document.createElement('div');
                orig_div.className = "orig_div";
                orig_div.style.display ="block";
                orig_div.appendChild(h5);
                orig_div.appendChild(p);
                if (section == "following" || section =="all"){
                    h4.addEventListener('click', ()=>{ 
                        showProfile(div.className,page);
                    });
                }
               
                
    // Edit button (For Poser only)

                if (document.querySelector(".nav-item-user").id == poser){
                    const edit_btn = document.createElement('button');
                    edit_btn.className = 'btn btn-dark';
                    edit_btn.innerHTML = "Edit";
                    edit_btn.style.width = "100px";
                    edit_btn.style.height ="40px";
                    
                    edit_btn.addEventListener("click",event=>{
                        const element = event.target;
                    //Step 1: Hide the post info
                        element.parentElement.style.display ="none";
                    //Step 2: Create edit form 
                        const edit_div = document.createElement("div");
                        const textarea = document.createElement("textarea");
                        const sub_btn = document.createElement("button");
                        
                        textarea.placeholder = "New Content";

                        sub_btn.className = 'btn btn-dark';
                        sub_btn.innerHTML = "Save";
                        sub_btn.style.width = "100px";
                        sub_btn.style.height ="40px";

                    // PUT Request send onsubmit //
                        sub_btn.onclick = ()=>{
                        let cookie = document.cookie.split("=");
                        let csrftoken = cookie[1];  
                            fetch(`/edit/${id}`,{
                                method: "PUT",
                                headers: {"X-CSRFToken":csrftoken},
                                body: JSON.stringify({
                                    content: `${textarea.value}`,
                                })
                            })
                            .then(response=>response.json())
                            .then(data=>{
                                console.log(data);
                                window.location.reload();
                            })
                            return false;
                        }      
                        edit_div.appendChild(textarea);
                        edit_div.appendChild(br);
                        edit_div.appendChild(sub_btn);
                        div.appendChild(edit_div);
                    })
                    orig_div.appendChild(edit_btn);
                }
                div.appendChild(orig_div);
                div.appendChild(like_btn);
                div.appendChild(span);

                if (section == "all" || section =="following"){
                    document.querySelector("#post").append(div);
                    document.querySelector("#post").append(br);
                }
                else {
                    document.querySelector("#profile").append(div);
                    document.querySelector("#profile").append(br);
                }
            }
        })
}


// Pagination function

function load(section){
    // Pagination button styling 
    const previous = document.createElement('button');
    const next = document.createElement('button');

    previous.innerHTML = 'Previous';
    previous.className = 'Previous';
    next.innerHTML = 'Next';
    next.className = 'Next';

// Previous / Next Button functionality :

    previous.style.border=" 0.1cm solid azure";
    previous.style.backgroundColor ="transparent";
    previous.style.marginLeft = "30px";
    previous.style.marginBottom = "50px";
    previous.style.width = "100px";
    previous.style.height ="40px";
    
    previous.addEventListener('click',()=>{
        counter-=1;
        if ( counter <=1 )
            counter = 1;
        // For the current fetch
        fetch(`/post/${section}/?page=${counter}`)
        .then(response=>response.json())
        .then(()=>{
        if (section =='following' || section == 'all'){
            showPage(section,counter);
        }
        else{
            showProfile(section,counter);
        }
        })
    })
    
    next.style.border=" 0.1cm solid azure";
    next.style.backgroundColor ="transparent";
    next.style.marginRight = "30px";
    next.style.marginBottom = "50px";
    next.style.width = "100px";
    next.style.height ="40px";
    next.style.float= 'right';

    next.addEventListener('click',()=>{
        counter +=1;
        let factor = counter;
        if (factor > 4){
            counter = 4;
        }
            
        fetch(`/post/${section}/?page=${factor}`)
        .then(response=>response.json())
        .then(()=>{
            if (section =='following' || section == 'all'){
                showPage(section,counter);
            }
            else{
                showProfile(section,counter);
            }
            
        })
    })
    if ( document.querySelector(".Previous") != null && document.querySelector(".Next") != null ){
       document.querySelector(".Previous").remove();
       document.querySelector(".Next").remove();
    }
    document.querySelector("#pagination").append(previous);
    document.querySelector("#pagination").append(next);
}

// Show Following Number
function following(username){
    fetch("/following",{
        method: "POST",
        body: JSON.stringify({
            user : `${username}`,
        })
    })
    .then(response => response.json())
    .then(data =>{
        const h5 = document.createElement("h5");
        h5.innerHTML = "Detail";
        const li = document.createElement("li");
        h5.style.marginLeft ="30px";
        li.style.marginLeft ="30px";
        li.style.marginBottom ="50px"; 
        li.innerHTML = `Following: ${data}`;
        document.querySelector("#profile").append(h5);
        document.querySelector("#profile").append(li);

    })
}

function remove_like(post_id){
    fetch(`get_post/${post_id}`)
    .then(response =>response.json())
    .then(data=>{
        like_count = parseInt(data.like);
        like_count -=1;
        fetch(`get_post/${post_id}`,{
            method: "PUT",
            body: JSON.stringify({
                "like":Number(like_count),
                "message": "remove",
            })
        })
        .then(response => response.json())
        .then(data=>{
            console.log(data.id);
            document.querySelectorAll(`.post_${data.id}`).forEach(element =>{
                element.innerText = data.like;
            })
        })
    })    
}

function add_like(post_id){
    fetch(`get_post/${post_id}`)
    .then(response=>response.json())
    .then(data=>{
        like_count = parseInt(data.like);
        like_count +=1;
        fetch(`get_post/${post_id}`,{
            method: "PUT",
            body: JSON.stringify({
                "like":Number(like_count),
                "message": "add",
                
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.id);
            document.querySelectorAll(`.post_${data.id}`).forEach(element =>{
                element.innerText = data.like; 
            })
        })
    })
}


