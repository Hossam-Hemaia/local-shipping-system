const select = document.getElementById('delivery');
const rejectionInput = document.getElementById('rejectedReason');


select.addEventListener('change', (e)=>{

    if(e.target.value === 'Rejected'){
        rejectionInput.style.display = 'block';
    }
    else{
        rejectionInput.style.display = 'none';
    }
})