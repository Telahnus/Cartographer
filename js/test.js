 $(document).ready(function(){

    var ref = new Firebase("https://docs-examples.firebaseio.com/web/saving-data/fireblog");
    var usersRef = ref.child("users");

    regBtn.click(function(){
      usersRef.set({
        alanisawesome: {
          date_of_birth: "June 1, 1789",
          full_name: "Alan Turing"
        },
        gracehop: {
          date_of_birth: "December 9, 1555",
          full_name: "Grace Hopper"
        }
      });
    });

});