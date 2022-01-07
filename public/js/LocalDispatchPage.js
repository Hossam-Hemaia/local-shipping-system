const submitBtn = document.getElementById('btn-submit');


submitBtn.addEventListener('click', (e)=>{
    const allSelect = document.querySelectorAll('.chosenOrNo');
    let status = true;

    allSelect.forEach(cur=>{
        if(cur.value === ""){
            e.preventDefault();
            status = false;
        }
    });
    
    if(status === false){
        alert('بعض المعلومات ناقصه');
    }
})