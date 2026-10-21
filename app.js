const profileForm = document.getElementById("profile-form");
const welcomeMessage = document.getElementById("welcome-message");

let selectedPlan = "standard";

function choosePlan(plan) {
  selectedPlan = plan;

  try {
    localStorage.setItem("trueform-plan", plan);
  } catch (error) {
    console.warn("Plan could not be saved on this device.");
  }

  const profileSection = document.getElementById("profile");
  if (profileSection) {
    profileSection.scrollIntoView({ behavior: "smooth" });
  }
}

function readSavedData(key) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    return null;
  }
}

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

if (profileForm) {
  profileForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(profileForm);
    const chosenMuscles = Array.from(
      document.getElementById("muscles").selectedOptions
    ).map(function (option) {
      return option.value;
    });

    const profile = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      age: formData.get("age"),
      gender: formData.get("gender"),
      height: formData.get("height"),
      weight: formData.get("weight"),
      location: formData.get("location"),
      goal: formData.get("goal"),
      experience: formData.get("experience"),
      muscles: chosenMuscles,
      additional: formData.get("additional"),
      plan: selectedPlan,
      updatedAt: new Date().toISOString()
    };

    const pictureInput = document.getElementById("picture");
    const picture = pictureInput.files[0];

    function finishProfile() {
      const saved = saveData("trueform-profile", profile);

      if (!saved) {
        alert(
          "Your browser could not save your profile. " +
          "Please check your device storage settings and try again."
        );
        return;
      }

      if (welcomeMessage) {
        welcomeMessage.textContent =
          "Welcome, " + profile.name +
          "! Your profile has been saved on this device. " +
          "Your selected goals will guide your workout setup.";
      }

      alert(
        "Profile saved on this device! " +
        "Next, explore your workout dashboard below."
      );

      document.getElementById("dashboard").scrollIntoView({
        behavior: "smooth"
      });
    }

    if (picture) {
      if (!picture.type.startsWith("image/")) {
        alert("Please choose an image file.");
        return;
      }

      if (picture.size > 2 * 1024 * 1024) {
        alert(
          "Please choose a profile picture smaller than 2 MB."
        );
        return;
      }

      const reader = new FileReader();

      reader.onload = function () {
        profile.picture = reader.result;
        finishProfile();
      };

      reader.onerror = function () {
        alert("We couldn't read that picture. Please try another.");
      };

      reader.readAsDataURL(picture);
    } else {
      finishProfile();
    }
  });
}

function getProfile() {
  return readSavedData("trueform-profile");
}

function getSelectedPlan() {
  try {
    return localStorage.getItem("trueform-plan") || "standard";
  } catch (error) {
    return "standard";
  }
}

function getWorkoutSuggestion(profile) {
  if (!profile) {
    return "Complete your profile to get started.";
  }

  const place = {
    home: "home",
    gym: "your gym",
    both: "home or your gym"
  }[profile.location] || "your chosen location";

  const goal = {
    muscle: "building muscle and strength",
    fitness: "improving general fitness",
    weight: "supporting weight management",
    strength: "building strength",
    health: "improving overall wellbeing"
  }[profile.goal] || "your fitness goals";

  let muscleText = "all major muscle groups";

  if (profile.muscles && profile.muscles.length) {
    if (profile.muscles.includes("full")) {
      muscleText = "all major muscle groups";
    } else {
      muscleText = profile.muscles.join(", ");
    }
  }

  return (
    "Your starting plan is focused on " + goal +
    ", training at " + place +
    ", with a focus on " + muscleText + "."
  );
}

function restoreDashboard() {
  const profile = getProfile();
  const message = document.getElementById("welcome-message");

  if (profile && message) {
    message.textContent =
      "Welcome back, " + profile.name + "! " +
      getWorkoutSuggestion(profile);
  }

  selectedPlan = getSelectedPlan();
}

restoreDashboard();
