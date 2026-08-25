// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    console.log("Form found:", form); // Debugging line to check if the form is found
    form.addEventListener(
      "submit",
      (event) => {
        console.log(event); // Debugging line to check the event object
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }// } location.href = "../../index.html?status=done";

        form.classList.add("was-validated");
      },
      false,
    );
  });
})();
