export default function Project4() {

  const driveLink = "https://drive.google.com/drive/folders/1PRltxJs8MD4Itk88yqCEr2wmL7ZkqwKm?usp=sharing";

  return (
    <>

      {/* OVERVIEW */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">Overview</h3>
        <p>
          Lab 4 focused on analog input using a potentiometer and joystick.
          The lab explored voltage dividers, analog-to-digital conversion,
          LED visualization, and culminated in building a Whack-a-MoLED game
          using joystick directional control.
        </p>
      </div>

      {/* MATERIALS */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">Materials Used</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Elegoo Arduino Uno R3</li>
          <li>Breadboard</li>
          <li>Jumper wires</li>
          <li>5 220Ω Resistors</li>
          <li>5 LEDs</li>
          <li>10k Potentiometer</li>
          <li>Joystick module</li>
          <li>Multimeter</li>
          <li>USB cable</li>
        </ul>
      </div> 


{/* CALCULATIONS */}
<div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
  <h3 className="font-medium text-foreground mb-4">
    Mathematical Calculations
  </h3>

  <div className="space-y-6 text-sm">

    {/* VOLTAGE DIVIDER */}
    <div className="rounded-xl border bg-white/60 p-4 shadow-md shadow-black/15">
      <p className="font-medium text-foreground mb-2">
        Potentiometer as Voltage Divider
      </p>

      <p>
        The 10kΩ potentiometer is wired between 5V and GND. 
        The middle pin outputs a voltage based on the ratio of resistance:
      </p>

      <p className="font-mono mt-2">
        Vout = Vin × (R2 / (R1 + R2))
      </p>

      <p className="mt-2">
        Since Vin = 5V and total resistance = 10kΩ:
      </p>

      <p className="font-mono">
        Vout ranges from 0V → 5V
      </p>
    </div>

    {/* ADC CONVERSION */}
    <div className="rounded-xl border bg-white/60 p-4 shadow-md shadow-black/15">
      <p className="font-medium text-foreground mb-2">
        Arduino 10-bit ADC Conversion
      </p>

      <p>
        The Arduino Uno uses a 10-bit ADC.
      </p>

      <p className="font-mono mt-2">
        2¹⁰ = 1024 values
      </p>

      <p>
        Therefore analogRead() maps:
      </p>

      <p className="font-mono">
        0V → 0  
        5V → 1023
      </p>

      <p className="mt-2">
        Each digital step represents:
      </p>

      <p className="font-mono">
        5V / 1023 ≈ 0.00489V per step
      </p>

      <p>
        So an analog reading of 512 corresponds to:
      </p>

      <p className="font-mono">
        512 × 0.00489 ≈ 2.5V
      </p>
    </div>

    {/* MAP FUNCTION */}
    <div className="rounded-xl border bg-white/60 p-4 shadow-md shadow-black/15">
      <p className="font-medium text-foreground mb-2">
        Mapping Potentiometer to LED Count
      </p>

      <p>
        The potentiometer value (0–1023) is converted to number of LEDs (0–5):
      </p>

      <p className="font-mono mt-2">
        ledsOn = map(potValue, 0, 1023, 0, 5)
      </p>

      <p>
        Example:
      </p>

      <p className="font-mono">
        potValue = 1023 → ledsOn = 5  
        potValue = 512 → ledsOn ≈ 2–3 LEDs
      </p>
    </div>

    {/* LED CURRENT */}
    <div className="rounded-xl border bg-white/60 p-4 shadow-md shadow-black/15">
      <p className="font-medium text-foreground mb-2">
        LED Current Limiting (Ohm’s Law)
      </p>

      <p>
        Using Ohm’s Law:
      </p>

      <p className="font-mono mt-2">
        V = I × R
      </p>

      <p>
        Assuming:
      </p>

      <p className="font-mono">
        Supply = 5V  
        LED forward voltage ≈ 2V  
        Desired current ≈ 20mA (0.02A)
      </p>

      <p className="font-mono mt-2">
        R = (5V − 2V) / 0.02A  
        R = 3 / 0.02  
        R = 150Ω
      </p>

      <p>
        A 220Ω resistor was used
      </p>
    </div>

  </div>
</div>






      {/* PART 1 */}
<div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
  <h3 className="font-medium text-foreground mb-4">
    Part 1 – Using a Potentiometer
  </h3>

  {/* DESCRIPTION */}
  <p className="mb-4">
    The potentiometer was wired in a voltage divider configuration with one
    fixed end connected to 5V, the other fixed end connected to GND, and the
    middle (variable) pin connected to analog pin A0 on the Arduino. Using
    the built-in 10-bit ADC, the Arduino converts the measured voltage
    (0–5V) into an integer value between 0–1023. Rotating the knob changes
    the resistance and therefore changes the voltage measured at A0.
  </p>

  {/* SCHEMATIC */}
  <div className="grid md:grid-cols-2 gap-6 mb-6">
    <figure className="space-y-2">
      <img
        src="/objectimages/schem1.JPG"
        alt="Potentiometer voltage divider schematic"
        className="rounded-xl border bg-white shadow-xl shadow-black/25"
      />
      <figcaption className="text-sm text-muted-foreground">
        Voltage divider configuration of a 10k potentiometer connected to
        analog pin A0.
      </figcaption>
    </figure>

    <figure className="space-y-2">
      <video
        src="/objectimages/p1.mp4"
        controls
        className="rounded-xl border bg-white shadow-xl shadow-black/25"
      />
      <figcaption className="text-sm text-muted-foreground">
        Serial Monitor output demonstrating analog values changing from
        0–1023 as the potentiometer is rotated.
      </figcaption>
    </figure>
  </div>

  {/* CODE */}
  <h4 className="font-medium text-foreground mb-2">Code</h4>
  <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`// pot connected to A0
const int potPin = A0;

// turn on Serial Monitor
void setup() {
  Serial.begin(9600);
}

void loop() {
  // read pot (0–1023)
  int potValue = analogRead(potPin);

  // print label
  Serial.print("Potentiometer Value: ");

  // print value
  Serial.println(potValue);

  // slow it down
  delay(100);
}`}
  </pre>
</div>










  {/* PART 2 */}
<div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
  <h3 className="font-medium text-foreground mb-4">
    Part 2 – Light ‘Em Up with a Potentiometer
  </h3>

  <p className="mb-4">
    Five LEDs were arranged linearly on the breadboard and connected to
    digital pins 2–6. The potentiometer reading (0–1023) was mapped to a
    value between 0 and 5 using the map() function. Based on this mapped
    value, LEDs turn on sequentially from left to right. When the
    potentiometer is fully left, no LEDs are on. As the knob rotates,
    LEDs progressively light up until all five are on at maximum rotation.
  </p>

  {/* SCHEMATIC + CIRCUIT PHOTO */}
  <div className="grid md:grid-cols-2 gap-6 mb-6">
    <figure className="space-y-2">
      <img
        src="/objectimages/schem2.JPG"
        alt="Linear 5 LED circuit schematic with potentiometer"
        className="rounded-xl border bg-white shadow-xl shadow-black/25"
      />
      <figcaption className="text-sm text-muted-foreground">
        Schematic for the potentiometer-controlled 5 LED circuit.
      </figcaption>
    </figure>

    <figure className="space-y-2">
      <img
        src="/objectimages/p1.JPG"
        alt="Breadboard circuit with potentiometer and five LEDs"
        className="rounded-xl border bg-white shadow-xl shadow-black/25"
      />
      <figcaption className="text-sm text-muted-foreground">
        Completed breadboard circuit showing the potentiometer and five LEDs wired to the Arduino.
      </figcaption>
    </figure>
  </div>

  {/* VIDEO */}
  <figure className="space-y-2 mb-6">
    <video
      src="/objectimages/p2_1.mp4"
      controls
      className="rounded-xl border bg-white shadow-xl shadow-black/25 w-full"
    />
    <figcaption className="text-sm text-muted-foreground">
      Demonstration of the LEDs turning on sequentially as the potentiometer is rotated.
    </figcaption>
  </figure>

  {/* LED STATES */}
  <div className="grid md:grid-cols-3 gap-6 mb-6">
    {["0led.JPG","1led.JPG","2led.JPG","3led.JPG","4led.JPG","5led.JPG"].map((img, index) => (
      <figure key={index} className="space-y-2">
        <img
          src={`/objectimages/${img}`}
          alt={`${index} LEDs illuminated`}
          className="rounded-xl border bg-white shadow-xl shadow-black/25 max-h-56 w-full object-cover"
        />
        <figcaption className="text-sm text-muted-foreground">
          {index} LED{index !== 1 ? "s" : ""} illuminated.
        </figcaption>
      </figure>
    ))}
  </div>

  {/* CODE */}
  <h4 className="font-medium text-foreground mb-2">Code</h4>
  <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`const int potPin = A0;
const int numLED = 5;

int array_1[5] = {2, 3, 4, 5, 6};  // declare int array with size 5 and values directly set

void setup() {
  Serial.begin(9600);

  // set all LED pins as outputs
  for (int i = 0; i < numLED; i++) {
    pinMode(array_1[i], OUTPUT);
  }
}

void loop() {

  // read 0–1023
  int potValue = analogRead(potPin); 

  // convert pot reading to 0–5
  int ledsOn = map(potValue, 0, 1023, 0, numLED);

  // turn LEDs on based on mapped value
  for (int i = 0; i < numLED; i++) {
    if (i < ledsOn) {
      digitalWrite(array_1[i], HIGH);
    } else {
      digitalWrite(array_1[i], LOW);
    }
  }

  delay(50);
}`}
  </pre>
</div>









      {/* PART 3 */}
<div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
  <h3 className="font-medium text-foreground mb-4">
    Part 3 – Joystick Input
  </h3>

  <p className="mb-4">
    The joystick module was connected with VRx to A0, VRy to A1, 5V and GND
    to power, and the push button (SW) connected to digital pin 7 using the
    Arduino’s internal pull-up resistor. The X and Y analog values range from
    0–1023, with approximately 512 representing the centered position. The
    button reads LOW when pressed and HIGH when released.
  </p>

  {/* SCHEMATIC + PHOTO */}
  <div className="grid md:grid-cols-2 gap-6 mb-6">
    <figure className="space-y-2">
      <img
        src="/objectimages/schem3.PNG"
        alt="Joystick wiring schematic"
        className="rounded-xl border bg-white shadow-xl shadow-black/25"
      />
      <figcaption className="text-sm text-muted-foreground">
        Joystick module connected to analog pins A0 (X) and A1 (Y), and digital pin 7 for the push button.
      </figcaption>
    </figure>

    <figure className="space-y-2">
      <img
        src="/objectimages/p3.JPG"
        alt="Physical joystick wiring on breadboard"
        className="rounded-xl border bg-white shadow-xl shadow-black/25"
      />
      <figcaption className="text-sm text-muted-foreground">
        Breadboard wiring showing joystick connections to the Arduino.
      </figcaption>
    </figure>
  </div>

  {/* VIDEO */}
<figure className="space-y-2 mb-6">
  <a
    href={driveLink}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-block rounded-xl border bg-white shadow-xl shadow-black/25 px-6 py-4 text-center font-medium text-foreground hover:bg-muted transition"
  >
    View Part 3 Video on Google Drive
  </a>
  <figcaption className="text-sm text-muted-foreground">
    Serial Monitor output demonstrating real-time X, Y, and button readings while moving the joystick.
  </figcaption>
</figure>

  {/* CODE */}
  <h4 className="font-medium text-foreground mb-2">Code</h4>
  <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`const int xPin = A0;      // joystick X axis connected to A0
const int yPin = A1;      // joystick Y axis connected to A1
const int buttonPin = 7;  // joystick button connected to digital pin 7

void setup() {
  Serial.begin(9600);          // start Serial Monitor
  pinMode(buttonPin, INPUT_PULLUP);  // use internal pull-up resistor for button
}

void loop() {
  int xValue = analogRead(xPin);   // read X position (0–1023)
  int yValue = analogRead(yPin);   // read Y position (0–1023)
  int buttonState = digitalRead(buttonPin);  // read button (LOW when pressed)

  Serial.print("X: ");        
  Serial.print(xValue);       

  Serial.print("   Y: ");
  Serial.print(yValue);       

  Serial.print("   Button: ");
  Serial.println(buttonState);  

  delay(100);   
}`}
  </pre>
</div>










{/* PART 4 */}
<div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
  <h3 className="font-medium text-foreground mb-4">
    Part 4 – Light ‘Em Up with a Joystick
  </h3>

  <p className="mb-4">
    The five LEDs were rearranged into a plus (+) configuration consisting of
    top, bottom, left, right, and center positions. The joystick’s X and Y
    analog values (0–1023) were divided into directional zones using threshold
    ranges. When the joystick is centered, only the center LED is illuminated.
    Moving the joystick activates the corresponding directional LED. Diagonal
    movements activate two LEDs simultaneously, producing a circular lighting
    pattern when rotated.
  </p>

  {/* SCHEMATIC / CIRCUIT IMAGE */}
  <figure className="space-y-2 mb-6">
    <img
      src="/objectimages/schem5.PNG"
      alt="Schematic for part 4"
      className="rounded-xl border bg-white shadow-xl shadow-black/25"
    />
    <figcaption className="text-sm text-muted-foreground">
      Plus-shaped LED configuration controlled by joystick X and Y analog input.
    </figcaption>
  </figure>

  {/* VIDEO */}
<figure className="space-y-2 mb-6">
  <a
    href={driveLink}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-block rounded-xl border bg-white shadow-xl shadow-black/25 px-6 py-4 text-center font-medium text-foreground hover:bg-muted transition"
  >
    View Part 4 Video on Google Drive
  </a>
  <figcaption className="text-sm text-muted-foreground">
    Demonstration of directional LED control using joystick movement.
  </figcaption>
</figure>


  {/* CODE */}
  <h4 className="font-medium text-foreground mb-2">Code</h4>
  <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`const int xPin = A0;
const int yPin = A1;

const int ledUp     = 2;  // top
const int ledLeft   = 3;  // left
const int ledCenter = 4;  // center
const int ledRight  = 5;  // right
const int ledDown   = 6;  // bottom

void setup() {

  pinMode(ledUp, OUTPUT);
  pinMode(ledLeft, OUTPUT);
  pinMode(ledCenter, OUTPUT);
  pinMode(ledRight, OUTPUT);
  pinMode(ledDown, OUTPUT);
}

void loop() {

  int xValue = analogRead(xPin);
  int yValue = analogRead(yPin);

  // Turn everything off first
  digitalWrite(ledUp, LOW);
  digitalWrite(ledLeft, LOW);
  digitalWrite(ledCenter, LOW);
  digitalWrite(ledRight, LOW);
  digitalWrite(ledDown, LOW);

  // Define movement zones
  bool left  = (xValue < 400);
  bool right = (xValue > 600);
  bool down  = (yValue < 400);
  bool up    = (yValue > 600);

  // If centered
  if (!left && !right && !up && !down) {
    digitalWrite(ledCenter, HIGH);
  }

  // Directions
  if (up)    digitalWrite(ledUp, HIGH);
  if (down)  digitalWrite(ledDown, HIGH);
  if (left)  digitalWrite(ledLeft, HIGH);
  if (right) digitalWrite(ledRight, HIGH);

  delay(50);
}`}
  </pre>
</div>







     {/* PART 5 */}
<div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
  <h3 className="font-medium text-foreground mb-4">
    Part 5 – Basic LED Whack-A-MoLED
  </h3>

  <p className="mb-4">
    This version of Whack-A-MoLED uses the joystick to “hit” randomly activated
    directional LEDs. Each round begins with a ready message and two 500ms blinks
    of the center LED. After a one-second pause, the timer starts and 20
    directional LEDs are activated one at a time in random order. The player
    must move the joystick in the correct direction to turn off the active LED.
    After all 20 hits are completed, the total time taken is calculated using
    <code>millis()</code> and displayed in seconds on the Serial Monitor.
  </p>

  {/* SCHEMATIC + CIRCUIT PHOTO */}
  <div className="grid md:grid-cols-2 gap-6 mb-6">
    <figure className="space-y-2">
      <img
        src="/objectimages/schem5.PNG"
        alt="Schematic for part 5"
        className="rounded-xl border bg-white shadow-xl shadow-black/25"
      />
      <figcaption className="text-sm text-muted-foreground">
        Plus-shaped LED configuration reused for the Whack-A-MoLED game.
      </figcaption>
    </figure>

    <figure className="space-y-2">
      <img
        src="/objectimages/p5.JPG"
        alt="Breadboard setup for Whack-A-MoLED"
        className="rounded-xl border bg-white shadow-xl shadow-black/25"
      />
      <figcaption className="text-sm text-muted-foreground">
        Physical circuit setup used for the Whack-A-MoLED game.
      </figcaption>
    </figure>
  </div>

 {/* VIDEO */}
<figure className="space-y-2 mb-6">
  <a
    href={driveLink}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-block rounded-xl border bg-white shadow-xl shadow-black/25 px-6 py-4 text-center font-medium text-foreground hover:bg-muted transition"
  >
    View Part 5 Gameplay Video on Google Drive
  </a>
  <figcaption className="text-sm text-muted-foreground">
    Gameplay demonstration showing 20 successful directional hits and final time output.
  </figcaption>
</figure>


  {/* CODE */}
  <h4 className="font-medium text-foreground mb-2">Code</h4>
  <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`const int xPin = A0;
const int yPin = A1;

const int ledUp     = 2; 
const int ledLeft   = 5;
const int ledCenter = 4;
const int ledRight  = 3;
const int ledDown   = 6;

const int totalHits = 20;

void setup() {
  Serial.begin(9600);

  pinMode(ledUp, OUTPUT);
  pinMode(ledLeft, OUTPUT);
  pinMode(ledCenter, OUTPUT);
  pinMode(ledRight, OUTPUT);
  pinMode(ledDown, OUTPUT);

  randomSeed(analogRead(A3));  // seed random generator
}

void loop() {

  // Welcome message
  Serial.println("Get Ready!");

  // Blink center LED twice 500ms each
  for (int i = 0; i < 2; i++) {
    digitalWrite(ledCenter, HIGH);
    delay(500);
    digitalWrite(ledCenter, LOW);
    delay(500);
  }

  // All LEDs off
  digitalWrite(ledUp, LOW);
  digitalWrite(ledLeft, LOW);
  digitalWrite(ledRight, LOW);
  digitalWrite(ledDown, LOW);

  // 1 second prep time
  delay(1000);

  // Start timer
  unsigned long startTime = millis();

  // 20 whacks
  for (int count = 0; count < totalHits; count++) {

    int active = random(0, 4);  
    bool hit = false;

    while (!hit) {

      int xValue = analogRead(xPin);
      int yValue = analogRead(yPin);

      bool left  = (xValue < 400);
      bool right = (xValue > 600);
      bool down  = (yValue < 400);
      bool up    = (yValue > 600);

      // turn off direction LEDs first
      digitalWrite(ledUp, LOW);
      digitalWrite(ledLeft, LOW);
      digitalWrite(ledRight, LOW);
      digitalWrite(ledDown, LOW);

      // turn on active LED
      if (active == 0) digitalWrite(ledUp, HIGH);
      if (active == 1) digitalWrite(ledDown, HIGH);
      if (active == 2) digitalWrite(ledLeft, HIGH);
      if (active == 3) digitalWrite(ledRight, HIGH);

      // check correct move
      if (active == 0 && up)    hit = true;
      if (active == 1 && down)  hit = true;
      if (active == 2 && left)  hit = true;
      if (active == 3 && right) hit = true;
      if (hit) {

  // waits until joystick returns to center so a successively lite led isn't counted twice for just holding the joystick in that direction
  while (true) {
    int xCenter = analogRead(xPin);
    int yCenter = analogRead(yPin);

    if (xCenter > 450 && xCenter < 550 &&
        yCenter > 450 && yCenter < 550) {
      break;
    }
  }
}
    }
  }

  // Stop timer
  unsigned long endTime = millis();
  unsigned long totalTime = endTime - startTime;

  Serial.print("Round complete! Time: ");
  Serial.print(totalTime / 1000.0);
  Serial.println(" seconds");

  // Wait 3 seconds before restarting
  delay(3000);
}`}
  </pre>
</div>
    </>
  );
}
