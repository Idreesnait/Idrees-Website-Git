export default function Project7() {

const driveLink = "https://drive.google.com/drive/folders/1L8y9oYL3v2Z1RLdI1T2nEIj3LHfA_N9V?usp=sharing";

return (
<>

{/* OVERVIEW */}
<div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
<h3 className="font-medium text-foreground mb-2">Overview</h3>

<p>
Lab 7 introduced the Processing programming environment and demonstrated how
to create interactive visualizations on the computer that are controlled by
hardware connected to an Arduino. The lab focused on establishing serial
communication between Arduino and Processing so that sensor data could be
used to control graphics in real time.
</p>

<p className="mt-3">
In this project, a joystick, potentiometer, and push button were connected
to the Arduino. These components were used to control a visualization inside
Processing. The joystick controlled the position of a circle on the screen,
the potentiometer controlled the size of the circle, and the button changed
the color of the circle. The Arduino continuously sent sensor values over
serial communication, which were parsed and interpreted by the Processing
sketch to update the animation.
</p>
</div>


{/* MATERIALS */}
<div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
<h3 className="font-medium text-foreground mb-2">Materials Used</h3>

<ul className="list-disc pl-5 space-y-1">
<li>Elegoo Arduino Uno R3</li>
<li>USB Cable</li>
<li>Breadboard</li>
<li>Joystick module</li>
<li>Push button</li>
<li>Potentiometer</li>
<li>Jumper wires</li>
<li>Processing IDE</li>
</ul>
</div>


{/* PART 1 */}
<div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">

<h3 className="font-medium text-foreground mb-4">
Part 1 – Creating Graphics with Processing
</h3>

<p className="mb-4">
The first part of the lab focused on learning the basics of Processing.
A simple sketch was written that created a window and drew a circle
at the position of the mouse cursor. The Processing environment runs
a continuous loop using the draw() function, which repeatedly redraws
the scene and allows the program to create animations and interactive
visualizations.
</p>

<p className="mb-4">
The sketch created a window of size 640 × 480 pixels and used the
ellipse() function to draw a circle that followed the mouse cursor.
The fill() function was used to set the color of the circle.
</p>

<h4 className="font-medium text-foreground mb-2">Processing Code</h4>

<pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`void setup() {
  size(640,480);
}

void draw() {

  fill(255);
  ellipse(mouseX, mouseY, 80, 80);

}`}
</pre>

</div>


{/* PART 2 */}
<div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">

<h3 className="font-medium text-foreground mb-4">
Part 2 – Arduino and Processing Communication
</h3>

<p className="mb-4">
In this part of the lab, the Arduino was connected to a joystick module.
The Arduino read the X and Y analog values from the joystick as well
as the state of the joystick push button. These values were formatted
into a serial message and sent to the computer using Serial.print().
</p>

<p className="mb-4">
The serial data was structured in a specific format so that Processing
could interpret the values correctly. Each message contained the
joystick X position, Y position, and button state.
</p>

<h4 className="font-medium text-foreground mb-2">Arduino Code</h4>

<pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`int xPin = A0;
int yPin = A1;
int swPin = 2;

void setup() {

  Serial.begin(9600);
  pinMode(swPin, INPUT_PULLUP);

}

void loop() {

  int xVal = analogRead(xPin);
  int yVal = analogRead(yPin);
  int swVal = digitalRead(swPin);

  Serial.print("xVal:");
  Serial.print(xVal);

  Serial.print(",yVal:");
  Serial.print(yVal);

  Serial.print(",swVal:");
  Serial.println(swVal);

  delay(50);
}`}
</pre>

<h4 className="font-medium text-foreground mt-6 mb-2">
Processing Code
</h4>

<pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`import processing.serial.*;
import java.util.Map;

Serial port;

String serialString;

HashMap<String, Integer> serialData = new HashMap<String, Integer>();

void setup() {

  size(640,480);

  printArray(Serial.list());

  String portName = "/dev/cu.usbmodem11101";

  port = new Serial(this, portName, 9600);
  port.bufferUntil('\\n');

}

void draw() {

  background(150);

  parseSerialData();

  if (!serialData.isEmpty()) {

    int xVal = serialData.get("xVal");
    int yVal = serialData.get("yVal");
    int swVal = serialData.get("swVal");

    int x = int(map(xVal,0,1023,0,width));
    int y = int(map(yVal,0,1023,0,height));

    if(swVal == 0){
      fill(0);
    }
    else{
      fill(255);
    }

    ellipse(x,y,80,80);

  }

}`}
</pre>

</div>


{/* PART 3 */}
<div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">

<h3 className="font-medium text-foreground mb-4">
Part 3 – Interactive Visualization
</h3>

<p className="mb-4">
The final part of the lab expanded the visualization by incorporating
additional hardware inputs. A potentiometer and an additional button
were added to the circuit. These components allowed the Processing
visualization to become more interactive.
</p>

<p className="mb-4">
The joystick controlled the position of the circle on the screen.
The potentiometer controlled the size of the circle by mapping the
analog value from the potentiometer to a range of circle sizes.
Pressing the button caused the circle color to change randomly.
</p>

<h4 className="font-medium text-foreground mb-2">Arduino Code</h4>

<pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`int xPin = A0;
int yPin = A1;
int potPin = A2;

int joyButton = 2;
int buttonPin = 3;

void setup() {

  Serial.begin(9600);

  pinMode(joyButton, INPUT_PULLUP);
  pinMode(buttonPin, INPUT_PULLUP);

}

void loop() {

  int xVal = analogRead(xPin);
  int yVal = analogRead(yPin);
  int potVal = analogRead(potPin);

  int joyVal = digitalRead(joyButton);
  int buttonVal = digitalRead(buttonPin);

  Serial.print("xVal:");
  Serial.print(xVal);

  Serial.print(",yVal:");
  Serial.print(yVal);

  Serial.print(",potVal:");
  Serial.print(potVal);

  Serial.print(",joyVal:");
  Serial.print(joyVal);

  Serial.print(",buttonVal:");
  Serial.println(buttonVal);

  delay(40);

}`}
</pre>

<h4 className="font-medium text-foreground mt-6 mb-2">
Processing Code
</h4>

<pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`import processing.serial.*;
import java.util.Map;

Serial port;

String serialString;

HashMap<String, Integer> serialData = new HashMap<String, Integer>();

color currentColor = color(255);

void setup() {

  size(640,480);

  printArray(Serial.list());

  String portName = "/dev/cu.usbmodem11101";

  port = new Serial(this, portName, 9600);
  port.bufferUntil('\\n');

}

void draw() {

  background(150);

  parseSerialData();

  if (serialData.containsKey("xVal") &&
      serialData.containsKey("yVal") &&
      serialData.containsKey("potVal") &&
      serialData.containsKey("buttonVal")) {

    int xVal = serialData.get("xVal");
    int yVal = serialData.get("yVal");
    int potVal = serialData.get("potVal");
    int buttonVal = serialData.get("buttonVal");

    int x = int(map(xVal,0,1023,0,width));
    int y = int(map(yVal,0,1023,0,height));

    int size = int(map(potVal,0,1023,20,200));

    if(buttonVal == 0){
      currentColor = color(random(255),random(255),random(255));
    }

    fill(currentColor);
    ellipse(x,y,size,size);

  }

}`}
</pre>

</div>


{/* MEDIA */}
<div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">

<h3 className="font-medium text-foreground mb-2">
Pictures and Video Documentation
</h3>

<p>
All images, circuit photos, and demonstration videos for this lab are
hosted in the Google Drive folder below. These include images of the
Arduino wiring, screenshots of the Processing sketches, and videos
showing the interactive visualization responding to hardware input.
</p>

<a
href={driveLink}
target="_blank"
className="text-teal-600 underline"
>
View Media Folder
</a>

</div>


{/* REFERENCES */}
<div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">

<h3 className="font-medium text-foreground mb-2">
References
</h3>

<ul className="list-disc pl-5 space-y-1">

<li>ATLS 3300 Lab 7 Instructions</li>
<li>Processing Documentation – processing.org</li>
<li>Processing Serial Library Reference</li>

</ul>

</div>

</>
);
}