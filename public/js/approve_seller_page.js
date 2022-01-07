const paymentMethod = document.getElementById('paymentSelect');
const ratioInput = document.getElementById('ratioInput');

paymentMethod.addEventListener('change', (e)=>{
    if (e.target.value === 'ratio'){
        ratioInput.style.display = 'block';
    }else{
        ratioInput.style.display = 'none';
    }
})