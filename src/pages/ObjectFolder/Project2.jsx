export default function Project2() {
  return (
    <>
      {/* OVERVIEW */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">Overview</h3>
        <p>
          Lab 2  introduced the Arduino IDE,
          and digital input/output. The lab focused on controlling LEDs using
          digital pins, reading button input, using the Serial Monitor for
          debugging, and combining these concepts to build an LED reaction
          game that measures human response time.
        </p>
      </div>

      {/* PROCESS */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">
          Process & Experiments
        </h3>
        <p>
          I began by installing and configuring the Arduino IDE and verifying
          communication with the Arduino Uno by running the built-in Blink
          example. After confirming correct board and port selection, I wired
          an external LED to a digital output pin and modified the Blink sketch
          to control the LED through code.
        </p>
        <p className="mt-3">
          Next, I added a push button as a digital input using a pull-down
          resistor. I tested button detection using the Serial Monitor and
          debugged oscillating input behavior caused by button bounce. Finally,
          I combined digital output, digital input, random timing, and time
          measurement to build a reaction-time game that outputs results over
          Serial.
        </p>
      </div>

      {/* SYSTEM */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">How It Works</h3>
        <p>
          The Arduino controls the LED using a digital output pin set HIGH (5V)
          or LOW (0V). A button connected with a pull-down resistor acts as a
          digital input, reading LOW when unpressed and HIGH when pressed.
        </p>
        <p className="mt-3">
          In the reaction game, the Arduino waits for a random delay, turns the
          LED on, and records the current time using <code>millis()</code>.
          When the button is pressed, the LED turns off and the elapsed time
          between LED activation and button press is calculated and printed to
          the Serial Monitor.
        </p>
      </div>

      {/* MATERIALS */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">Materials</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Elegoo Arduino Uno R3</li>
          <li>USB cable & USB adapter</li>
          <li>830-point breadboard</li>
          <li>LEDs</li>
          <li>Resistors (220Ω, 10kΩ)</li>
          <li>Push button</li>
          <li>Jumper wires</li>
          <li>Multimeter</li>
        </ul>
      </div>

      {/* CALCULATIONS */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">Calculations</h3>

        <p className="mb-4">
          Ohm’s Law (V = I × R) was used to determine safe resistor values for
          the LED and button circuits.
        </p>

        <div className="space-y-4 text-sm">
          <div className="rounded-xl border bg-white/60 p-4 shadow-md shadow-black/15">
            <p className="font-medium text-foreground mb-1">LED Current Limit</p>
            <p>Assuming a 5V digital output and ~20 mA LED current:</p>
            <p className="font-mono">
              R = (5V − 2V) / 0.02A ≈ 150Ω
            </p>
            <p>
              A 220Ω resistor was used to further limit current and protect the
              LED.
            </p>
          </div>

          <div className="rounded-xl border bg-white/60 p-4 shadow-md shadow-black/15">
            <p className="font-medium text-foreground mb-1">
              Button Pull-Down Resistor
            </p>
            <p>
              A 10kΩ resistor was used to pull the input pin to ground when the
              button is not pressed, preventing floating values and accidental
              triggering.
            </p>
          </div>
        </div>
      </div>

     {/* SCHEMATICS */}
<div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
  <h3 className="font-medium text-foreground mb-4">Schematics</h3>

  <div className="grid md:grid-cols-2 gap-6">
    <figure className="space-y-2">
      <img
        src="/objectimages/d1.JPG"
        alt="Arduino external LED schematic"
        className="rounded-xl border bg-white shadow-xl shadow-black/25"
      />
      <figcaption className="text-sm text-muted-foreground">
        External LED connected to an Arduino digital output pin using a 220Ω current-limiting resistor.
      </figcaption>
    </figure>

    <figure className="space-y-2">
      <img
        src="/objectimages/d2.JPG"
        alt="Arduino button input schematic with pull-down resistor"
        className="rounded-xl border bg-white shadow-xl shadow-black/25"
      />
      <figcaption className="text-sm text-muted-foreground">
        Push button wired as a digital input using a 10kΩ pull-down resistor.
      </figcaption>
    </figure>
  </div>
</div>


   {/* IMAGES & VIDEO */}
<div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
  <h3 className="font-medium text-foreground mb-4">Images & Video</h3>

  <div className="grid md:grid-cols-2 gap-6">
    {/* PART 1 */}
    <figure className="space-y-2">
      <video
        src="/objectimages/2o1.MOV"
        controls
        className="rounded-xl border bg-white shadow-xl shadow-black/25"
      />
      <figcaption className="text-sm text-muted-foreground">
        Arduino Uno connected and running the built-in Blink example.
      </figcaption>
    </figure>

    {/* PART 2 */}
    <figure className="space-y-2">
      <video
        src="/objectimages/2o2.MOV"
        controls
        className="rounded-xl border bg-white shadow-xl shadow-black/25"
      />
      <figcaption className="text-sm text-muted-foreground">
        External LED blinking when controlled through a digital output pin.
      </figcaption>
    </figure>

    <figure className="space-y-2">
      <video
        src="/objectimages/2o3.MOV"
        controls
        className="rounded-xl border bg-white shadow-xl shadow-black/25"
      />
      <figcaption className="text-sm text-muted-foreground">
        Modified blink timing demonstrating control over delay duration.
      </figcaption>
    </figure>

    {/* PART 3 */}
    <figure className="space-y-2">
      <video
        src="/objectimages/2o4.MOV"
        controls
        className="rounded-xl border bg-white shadow-xl shadow-black/25"
      />
      <figcaption className="text-sm text-muted-foreground">
        Serial Monitor output confirming correct button press detection.
      </figcaption>
    </figure>

    {/* PART 4 – FINAL GAME */}
    <figure className="space-y-2">
      <img
        src="/objectimages/2o5.JPG"
        alt="Final breadboard wiring configuration"
        className="rounded-xl border bg-white shadow-xl shadow-black/25"
      />
      <figcaption className="text-sm text-muted-foreground">
        Final physical setup showing the breadboard wiring configuration and component layout.
      </figcaption>
    </figure>

    <figure className="space-y-2">
      <video
        src="/objectimages/2o6.MOV"
        controls
        className="rounded-xl border bg-white shadow-xl shadow-black/25"
      />
      <figcaption className="text-sm text-muted-foreground">
        Final LED reaction game circuit combining digital output, button input, and timing logic.
      </figcaption>
    </figure>
  </div>
</div>


   {/* CODE */}
<div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
  <h3 className="font-medium text-foreground mb-4">Code</h3>

  <p className="mb-4">
    The following Arduino sketches were developed incrementally across the lab,
    building from basic digital output to a full LED reaction game.
  </p>

  {/* PART 1 & 2 */}
  <div className="mb-6">
    <h4 className="font-medium text-foreground mb-2">
      Part 1 & 2 – External LED Blink
    </h4>
    <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`int LED_PIN = 10;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(1000);
  digitalWrite(LED_PIN, LOW);
  delay(1000);
}`}
    </pre>
  </div>

  {/* PART 3 */}
  <div className="mb-6">
    <h4 className="font-medium text-foreground mb-2">
      Part 3 – Button Input & Serial Monitor
    </h4>
    <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`int LED_PIN = 10;
int BUTTON_PIN = 7;

bool printedWaiting = false;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT);
  Serial.begin(9600);
}

void loop() {
  int state = digitalRead(BUTTON_PIN);

  if (state == LOW) {
    if (!printedWaiting) {
      Serial.println("Waiting");
      printedWaiting = true;
    }
  } else {
    Serial.println("Button pressed");
    printedWaiting = false;
    delay(300);
  }
}`}
    </pre>
  </div>

  {/* PART 4 */}
  <div>
    <h4 className="font-medium text-foreground mb-2">
      Part 4 – LED Reaction Game
    </h4>
    <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`int LED_PIN = 10;
int BUTTON_PIN = 7;

unsigned long startTime;
unsigned long reactionTime;

bool greeted = false;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT);
  Serial.begin(9600);

  randomSeed(analogRead(A0));
}

void loop() {

  if (!greeted) {
    Serial.println("Hello Welcome to the Reaction Game");
    greeted = true;
    delay(1000);
  }

  Serial.println("Ready?");
  delay(1000);

  int waitTime = random(500, 5000);
  delay(waitTime);

  digitalWrite(LED_PIN, HIGH);
  startTime = millis();

  while (digitalRead(BUTTON_PIN) == LOW) {

  }

  reactionTime = millis() - startTime;
  digitalWrite(LED_PIN, LOW);

  Serial.print("Reaction time: ");
  Serial.print(reactionTime);
  Serial.println(" ms");

  Serial.println("Next round in 5 seconds reminding u to lock in...");
  delay(5000);
}`}
    </pre>
  </div>
</div>


      {/* PROBLEMS */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">
          Problems Faced & Conclusion
        </h3>
        <p>
          The main challenge was inconsistent button readings caused by
          mechanical button bounce. This resulted in multiple rapid HIGH/LOW
          transitions for a single press. This issue can be addressed through
          software debouncing techniques such as short delays or state checks.
        </p>
        <p className="mt-3">
          Overall, this lab successfully demonstrated how digital input and
          output, timing functions, and serial communication can be combined
          to create interactive physical systems.
        </p>
      </div>

      {/* REFERENCES */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">
          References & Sources
        </h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Arduino Documentation</li>
          <li>ATLS 3300 Lecture & Lab Slides</li>
          <li>Arduino IDE Reference</li>
        </ul>
      </div>
    </>
  );
}
