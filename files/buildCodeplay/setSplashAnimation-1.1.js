const fs = require('fs');
const readline = require('readline');
const path = require('path');

// Define the root directory of the project (adjust if needed)
const projectRoot = path.join('android/app/src/main');

// Animation options
const animations = [
  { id: 1, name: 'Ripple Effect', code: `.scaleX(1.2f).scaleY(1.2f).alpha(0.3f)` },  //Okay super
  { id: 2, name: 'Pop Out', code: `.scaleX(1.2f).scaleY(1.2f).alpha(0f)` },  //Okay super
  { id: 3, name: 'Super Zoom', code: `.scaleX(1.5f).scaleY(1.5f).alpha(1f)` }, //Okay super
  

  { id: 4, name: 'Flip and Fade', code: `.scaleX(0f).scaleY(0f).rotation(180f).alpha(0f)` }, //Okay
  { id: 5, name: 'Wipe Away', code: `.translationX(splashScreenView.getWidth()).alpha(0f)` }, //Okay
  { id: 6, name: 'Bounce in Spiral', code: `.scaleX(0.5f).scaleY(0.5f).alpha(0.5f).rotation(360f)` },  //Okay
  { id: 7, name: 'Fade and Slide', code: `.alpha(0f).translationY(splashScreenView.getHeight())` },  //Okay
  { id: 8, name: 'Zoom Out with Bounce', code: `.scaleX(0f).scaleY(0f).alpha(0f).translationY(splashScreenView.getHeight())` },  //Okay
  { id: 9, name: 'Twist', code: `.rotation(720f).alpha(0f)` }, //Okay
  { id: 10, name: 'Rotate Back', code: `.rotation(-360f).alpha(1f)` },  //Okay
  { id: 11, name: 'Stretch In', code: `.scaleX(1.5f).scaleY(1.5f).alpha(1f)` }, //Okay
  { id: 12, name: 'Fade and Scale', code: `.alpha(0f).scaleX(0f).scaleY(0f)` }, //Okay
  { id: 13, name: 'Slide Left and Fade', code: `.translationX(-splashScreenView.getWidth()).alpha(0f)` }, //Okay


  { id: 14, name: 'Fade Out', code: `.alpha(0f)` },
  { id: 15, name: 'Slide Down', code: `.translationY(splashScreenView.getHeight())` },
  { id: 16, name: 'Zoom Out', code: `.scaleX(0f).scaleY(0f).alpha(0f)` },
  { id: 17, name: 'Rotate Out', code: `.rotation(360f).alpha(0f)` },
  { id: 18, name: 'Slide Up', code: `.translationY(-splashScreenView.getHeight()).alpha(0f)` },
  { id: 19, name: 'Bounce Effect', code: `.translationY(splashScreenView.getHeight())` },
  { id: 20, name: 'Flip Out', code: `.scaleX(0f).alpha(0f)` },
  { id: 21, name: 'Diagonal Slide and Fade Out', code: `.translationX(splashScreenView.getWidth()).translationY(splashScreenView.getHeight()).alpha(0f)` },
  { id: 22, name: 'Scale Down with Bounce', code: `.scaleX(0f).scaleY(0f)` },
  { id: 23, name: 'Slide Left', code: `.translationX(-splashScreenView.getWidth()).alpha(0f)` },
  { id: 24, name: 'Slide Right', code: `.translationX(splashScreenView.getWidth()).alpha(0f)` },
  { id: 25, name: 'Scale Up', code: `.scaleX(1f).scaleY(1f).alpha(1f)` },
  { id: 26, name: 'Rotate In', code: `.rotation(180f).alpha(1f)` },
  { id: 27, name: 'Bounce Up', code: `.translationY(-100f).setInterpolator(new BounceInterpolator())` },
  { id: 28, name: 'Flip Horizontal', code: `.scaleX(-1f).alpha(1f)` },
  { id: 29, name: 'Zoom In', code: `.scaleX(1f).scaleY(1f).alpha(1f)` },
  { id: 30, name: 'Wobble', code: `.translationX(10f).translationX(-10f).translationX(10f)` },
  { id: 31, name: 'Vertical Shake', code: `.translationY(10f).translationY(-10f).translationY(10f)` },
  { id: 32, name: 'Bounce Down', code: `.translationY(100f).setInterpolator(new BounceInterpolator())` },
  { id: 33, name: 'Swing', code: `.rotation(15f).translationX(-10f).rotation(-15f).translationX(10f)` },
  { id: 34, name: 'Elastic Bounce', code: `.translationX(30f).translationX(-30f).translationX(15f).translationX(-15f)` },
  { id: 35, name: 'Pulse', code: `.scaleX(1.1f).scaleY(1.1f).alpha(1f).setRepeatMode(ValueAnimator.REVERSE).setRepeatCount(ValueAnimator.INFINITE)` },
  { id: 36, name: 'Skew', code: `.setRotationX(30f).setRotationY(30f).alpha(0.5f)` },
  { id: 37, name: 'Vibrate', code: `.translationX(5f).translationX(-5f).translationX(5f).translationX(-5f)` },
  { id: 38, name: 'Speed Out', code: `.alpha(0f).setDuration(300)` },
  { id: 39, name: 'Wave', code: `.translationX(20f).translationX(-20f).translationX(20f).translationX(-20f)` },
  { id: 40, name: 'Swing Bounce', code: `.rotation(15f).translationX(10f).translationX(-10f)` },
];


// Function to find the package name from capacitor.config.json
function findPackageName() {
  const configPath = path.join('capacitor.config.json');
  if (!fs.existsSync(configPath)) {
    console.error('capacitor.config.json not found. Ensure this is a valid Capacitor project.');
    process.exit(1);
  }

  const configContent = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  return configContent.appId;
}

// Function to construct the MainActivity.java path
function constructMainActivityPath(packageName) {
  const packagePath = packageName.replace(/\./g, '/'); // Convert package name to path
  const mainActivityPath = path.join('android', 'app', 'src', 'main', 'java', packagePath, 'MainActivity.java');
  
  console.log('MainActivity path:', mainActivityPath);  // Output for debugging
  return mainActivityPath;
}

// Find package name and MainActivity.java path
const packageName = findPackageName();
if (!packageName) {
  console.error('Failed to extract the package name from capacitor.config.json.');
  process.exit(1);
}

const mainActivityPath = constructMainActivityPath(packageName);

// Display animation options
/* const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
}); */

console.log('Select an animation type for the splash screen:');
animations.forEach((animation) => {
  //console.log(`${animation.id}. ${animation.name}`);
});

// Prompt user for animation selection
//rl.question('Enter the number of the animation type: ', (answer) => {

  const answer=1;

  const selectedAnimation = animations.find((anim) => anim.id === parseInt(answer, 10));

  if (!selectedAnimation) {
    console.log('Invalid selection. Please run the script again.');
    //rl.close();
    return;
  }

  console.log(`Selected: ${selectedAnimation.name}`);

  // Read the MainActivity.java file
  fs.readFile(mainActivityPath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading MainActivity.java: ${err.message}`);
      //rl.close();
      return;
    }

    // New logic for removing existing code and adding new splash screen animation code
    const newMainActivityCode =
`package ${findPackageName()};

import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;


    public class MainActivity extends BridgeActivity {
        @Override
        protected void onCreate(Bundle savedInstanceState) {
            super.onCreate(savedInstanceState);

            // Handle custom splash screen exit animation
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                getSplashScreen().setOnExitAnimationListener(splashScreenView -> {
                    // Add your custom animation here (e.g., fade out)
                    splashScreenView.setAlpha(1f);
                    splashScreenView.animate()
                            ${selectedAnimation.code} // Apply selected animation
                            .setDuration(1000) // Animation duration (1000ms)
                            .withEndAction(splashScreenView::remove) // Remove splash screen
                            .start();
                });
            }
        }
    }
    `;

    // Write the new MainActivity.java content
    writeMainActivity(newMainActivityCode);
  });

  //rl.close();
//});

// Write updated data to MainActivity.java
function writeMainActivity(updatedData) {
  fs.writeFile(mainActivityPath, updatedData, 'utf8', (err) => {
    if (err) {
      console.error(`Error writing to MainActivity.java: ${err.message}`);
      return;
    }
    console.log('MainActivity.java updated successfully!');
  });
}
