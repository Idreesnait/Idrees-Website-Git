export default function Project5() {

  const driveLink = "https://drive.google.com/drive/folders/1h2G12lT6g9u246gI6kkWrHgdLF5k_Pa7?usp=sharing";

  return (
    <>
      {/* OVERVIEW */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">Overview</h3>
        <p>
          Lab 5 focused on analog output and sound generation using PWM and
          frequency control. The project explored RGB color mixing using
          analogWrite(), joystick-driven dynamic color control, sound
          generation using a passive buzzer with tone(), and culminated
          in creating a melody generator and audio-visualizer.
        </p>
      </div>

      {/* PHOTOS & VIDEOS */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">Photos & Videos</h3>
        <p className="mb-3">
          All circuit photos, schematics, and video demonstrations for this lab
          are hosted externally due to GitHub file size limitations.
        </p>
        <p>
          Full documentation media can be accessed here:
        </p>
        <a
          href={driveLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-600 underline break-all"
        >
          {driveLink}
        </a>
      </div>

      {/* MATERIALS */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">Materials Used</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Elegoo Arduino Uno R3</li>
          <li>Breadboard</li>
          <li>Jumper wires</li>
          <li>3 × 220Ω resistors</li>
          <li>RGB LED (common cathode)</li>
          <li>Joystick module</li>
          <li>Passive buzzer</li>
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
          <div className="rounded-xl border bg-white/60 p-4 shadow-md shadow-black/15">
            <p className="font-medium text-foreground mb-2">
              LED Current Limiting
            </p>
            <p className="font-mono">
              R = (5V − 2V) / 0.02A = 150Ω
            </p>
            <p>
              220Ω resistors were used for safe current limiting.
            </p>
          </div>
        </div>
      </div>

      {/* PART 1 */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-4">
          Part 1 – RGB LED Color Control
        </h3>

        <p className="mb-4">
          The RGB LED was connected to PWM pins 9, 10, and 11.
          Each color channel was controlled independently using analogWrite().
        </p>

        <h4 className="font-medium text-foreground mb-2">Code</h4>
        <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`const int R_LED_PIN = 11;
const int G_LED_PIN = 10;
const int B_LED_PIN = 9;

void setup() {
  pinMode(R_LED_PIN, OUTPUT);
  pinMode(G_LED_PIN, OUTPUT);
  pinMode(B_LED_PIN, OUTPUT);
}

void setColor(int r, int g, int b) {
  analogWrite(R_LED_PIN, r);
  analogWrite(G_LED_PIN, g);
  analogWrite(B_LED_PIN, b);
}

void loop() {

  setColor(255, 255, 255);
  delay(2000);

  setColor(190, 52, 85);
  delay(2000);

  setColor(10, 147, 150);
  delay(2000);

  setColor(128, 0, 128);
  delay(2000);

}`}
        </pre>
      </div>

      {/* PART 2 */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-4">
          Part 2 – Joystick Dynamic Color Control
        </h3>

        <p className="mb-4">
          Joystick X controls Red, Y controls Blue,
          and Green is randomly generated.
        </p>

        <h4 className="font-medium text-foreground mb-2">Code</h4>
        <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`const int R = 11;
const int G = 10;
const int B = 9;

const int xPin = A0;
const int yPin = A1;

int greenVal = 0;
unsigned long lastChange = 0;

void setup() {
  pinMode(R, OUTPUT);
  pinMode(G, OUTPUT);
  pinMode(B, OUTPUT);
  randomSeed(analogRead(A3));
}

void loop() {
  int x = analogRead(xPin);
  int y = analogRead(yPin);

  x = (x + analogRead(xPin) + analogRead(xPin)) / 3;
  y = (y + analogRead(yPin) + analogRead(yPin)) / 3;

  int red  = map(x, 0, 1023, 0, 255);
  int blue = map(y, 0, 1023, 0, 255);

  if (millis() - lastChange > 600) {
    greenVal = random(0, 256);
    lastChange = millis();
  }

  analogWrite(R, red);
  analogWrite(G, greenVal);
  analogWrite(B, blue);
}`}
        </pre>
      </div>

      {/* PART 3 */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-4">
          Part 3 – Passive Buzzer Beep
        </h3>

        <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto mb-8">
{`const int buzzerPin = 10;

void setup() {
  pinMode(buzzerPin, OUTPUT);
}

void loop() {
  tone(buzzerPin, 440);
  delay(1000);
  noTone(buzzerPin);
  delay(1000);
}`}
        </pre>

        <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`#include "pitches.h"

const int buzzerPin = 10;

void setup() {
  pinMode(buzzerPin, OUTPUT);
}

void loop() {
  tone(buzzerPin, NOTE_A2);
  delay(1000);
  noTone(buzzerPin);
  delay(1000);
}`}
        </pre>
      </div>

      {/* PART 4 */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-4">
          Part 4 – Melody Generator
        </h3>

        <h4 className="font-medium text-foreground mb-2">Code</h4>
        <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`#include "pitches copy.h"

const int buzzerPin = 10;
const int full_note = 800;

int melody[] = { NOTE_A4, NOTE_E5, NOTE_A4, NOTE_E5,
                 NOTE_G4, NOTE_E5, NOTE_G4, NOTE_E5,
                 NOTE_F4, NOTE_E5, NOTE_F4, NOTE_E5,
                 NOTE_G4, NOTE_E5, NOTE_G4, NOTE_E5 };

int noteType[] = { 4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4 };
int dotted[] = { 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 };

int length = 16;

void setup() {
  pinMode(buzzerPin, OUTPUT);
}

void loop() {
  for (int i = 0; i < length; i++) {
    int duration = full_note / noteType[i];
    if (dotted[i] == 1) {
      duration = duration * 1.5;
    }
    tone(buzzerPin, melody[i], duration);
    delay(duration * 1.2);
    noTone(buzzerPin);
  }
  delay(2000);
}`}
        </pre>
      </div>

      {/* PROBLEMS */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-4">
          Problems Faced & Conclusion
        </h3>

        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>I struggled more with organizing and refining my documentation than with the technical build itself, as the lab work felt intuitive and rewarding once the circuits and code were functioning properly.</li>
        
        </ul>
      </div>

      {/* REFERENCES */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-4">
          References & Sources
        </h3>

        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Arduino Documentation</li>
          <li>analogWrite() Reference</li>
          <li>tone() Reference</li>
          <li>rapidtables.com RGB Chart</li>
        </ul>
      </div>

    </>
  );
}