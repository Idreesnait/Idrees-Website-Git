export default function Project6() {

const driveLink = "https://drive.google.com/drive/folders/1J0kE8fh7D64KdWzZhnvVbAtdHcvVMtpH?usp=sharing";

  return (
    <>

      {/* OVERVIEW */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">Overview</h3>
        <p>
          Lab 6 explored motor control using Arduino. Two types of motors were
          used: a servo motor for precise angular control and a DC motor for
          continuous rotation. The lab introduced external motor power,
          motor drivers (L293D), PWM-based speed control, and combining both
          motors to build a small oscillating table fan.
        </p>
      </div>

      {/* MATERIALS */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">Materials Used</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Elegoo Arduino Uno R3</li>
          <li>Breadboard</li>
          <li>Jumper wires</li>
          <li>Power supply module</li>
          <li>Servo Motor (SG90)</li>
          <li>DC Motor + Fan blade</li>
          <li>L293D Motor Driver IC</li>
          <li>Potentiometer</li>
          <li>9V Battery with snap connector</li>
          <li>Multimeter</li>
          <li>USB cable</li>
        </ul>
      </div>

      {/* PART 1 */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-4">
          Part 1 – Wiring and Controlling the Servo
        </h3>

        <p className="mb-4">
          The servo motor was connected to the Arduino using three wires:
          power (5V), ground (GND), and signal. The signal line was connected
          to a PWM-capable digital pin on the Arduino. Using the Servo.h
          library, the servo can be controlled by writing angles between
          0° and 180°. A sample sweep program was used to rotate the servo
          from one extreme to the other repeatedly.
        </p>

        <h4 className="font-medium text-foreground mb-2">Code</h4>

        <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`// PART 1 CODE
// #include <Servo.h>

Servo servoA;

int pos = 0;

void setup() {
  servoA.attach(6);
}

void loop() {

  for (pos = 0; pos <= 180; pos += 1) {
    servoA.write(pos);
    delay(15);
  }

  for (pos = 180; pos >= 0; pos -= 1) {
    servoA.write(pos);
    delay(15);
  }

}`}
        </pre>
      </div>

      {/* PART 2 */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-4">
          Part 2 – Controlling the Servo with a Potentiometer
        </h3>

        <p className="mb-4">
          A potentiometer was used to control the servo angle. The analog
          reading from the potentiometer (0–1023) was converted into an
          angle value for the servo. Rotating the potentiometer caused the
          servo to move proportionally between its minimum and maximum angles.
        </p>

        <h4 className="font-medium text-foreground mb-2">Code (Part 2A)</h4>

        <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`// PART 2A CODE
// #include <Servo.h>

Servo servoA;

int potPin = A0;
int potValue;
int angle;

void setup() {
  servoA.attach(6);
}

void loop() {

  potValue = analogRead(potPin);

  angle = map(potValue, 0, 1023, 0, 180);

  servoA.write(angle);

  delay(15);
}`}
        </pre>

        <h4 className="font-medium text-foreground mt-6 mb-2">Code (Part 2B)</h4>

        <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`// PART 2B CODE
// #include <Servo.h>

Servo servoA;

int potPin = A0;
int pos;

void setup() {
  servoA.attach(6);
}

void loop() {

  for (pos = 0; pos <= 180; pos++) {
    int delayTime = map(analogRead(potPin), 0, 1023, 5, 50);
    servoA.write(pos);
    delay(delayTime);
  }

  for (pos = 180; pos >= 0; pos--) {
    int delayTime = map(analogRead(potPin), 0, 1023, 5, 50);
    servoA.write(pos);
    delay(delayTime);
  }

}`}
        </pre>
      </div>

      {/* PART 3 */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-4">
          Part 3 – DC Motor and Motor Driver
        </h3>

        <p className="mb-4">
          A DC motor was controlled using an L293D motor driver. The motor
          driver allows the Arduino to control both the direction and speed
          of the motor while using a separate power supply for the motor.
          Direction is controlled using two input pins, while speed can be
          adjusted using PWM through the enable pin.
        </p>

        <h4 className="font-medium text-foreground mb-2">Code (Part 3A)</h4>

        <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`// PART 3A CODE
// const int enA = 11;
const int in1 = 8;
const int in2 = 7;

void setup() {
    pinMode(enA, OUTPUT);
    pinMode(in1, OUTPUT);
    pinMode(in2, OUTPUT);

    digitalWrite(enA, LOW);
    digitalWrite(in1, LOW);
    digitalWrite(in2, LOW);
}

void loop() {
    
    forward();
    delay(2000);

    
    stop();
    delay(1000);

    
    backward();
    delay(2000);

    
    stop();
    delay(1000);
}

void forward() {
    digitalWrite(in1, HIGH);
    digitalWrite(in2, LOW);

    digitalWrite(enA, HIGH);
}

void backward() {
}

void stop() {
    digitalWrite(enA, LOW);
    digitalWrite(in1, LOW);
    digitalWrite(in2, LOW);
}`}
        </pre>

        <h4 className="font-medium text-foreground mt-6 mb-2">Code (Part 3B)</h4>

        <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`// PART 3B CODE
// const int enA = 11;
const int in1 = 8;
const int in2 = 7;

void setup() {

  pinMode(enA, OUTPUT);
  pinMode(in1, OUTPUT);
  pinMode(in2, OUTPUT);

}

void loop() {

  rampUp();
  delay(1000);

  rampDown();
  delay(1000);

}

void rampUp() {

  digitalWrite(in1, HIGH);
  digitalWrite(in2, LOW);

  for(int speed = 0; speed <= 255; speed++) {
    analogWrite(enA, speed);
    delay(10);
  }

}

void rampDown() {

  digitalWrite(in1, HIGH);
  digitalWrite(in2, LOW);

  for(int speed = 255; speed >= 0; speed--) {
    analogWrite(enA, speed);
    delay(10);
  }

}`}
        </pre>
      </div>

      {/* PART 4 */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-4">
          Part 4 – Oscillating Table Fan
        </h3>

        <p className="mb-4">
          The final part of the lab combines the servo motor and DC motor.
          The DC motor spins a small fan blade while the servo motor slowly
          rotates the entire assembly back and forth. This creates a small
          oscillating fan similar to a tabletop fan.
        </p>

        <p className="text-sm text-muted-foreground">
          Note: My signal wire detached from the servo motor during testing.
          I was not able to reattach it securely before finishing the
          documentation, so images for this section are not included.
        </p>

        <h4 className="font-medium text-foreground mt-4 mb-2">Code</h4>

        <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`// PART 4 CODE
// #include <Servo.h>

Servo servoA;
const int enA = 11;
const int in1 = 8;
const int in2 = 7;

int pos = 0;

void setup() {

servoA.attach(9);

  pinMode(enA, OUTPUT);
  pinMode(in1, OUTPUT);
  pinMode(in2, OUTPUT);

  digitalWrite(in1, HIGH);
  digitalWrite(in2, LOW);

  analogWrite(enA, 178);  // 70% speed
}

void loop() {

  for (pos = 0; pos <= 120; pos++) {
    servoA.write(pos);
    delay(20);
  }

  for (pos = 120; pos >= 0; pos--) {
    servoA.write(pos);
    delay(20);
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
          All images and videos for this lab are hosted in the Google Drive
          folder below. GitHub was not used to store the images because the
          number of media files exceeded what is practical to store directly
          in the repository.
        </p>

        <a
          href={driveLink}
          target="_blank"
          className="text-teal-600 underline"
        >
          View Media Folder
        </a>
      </div>

      {/* PROBLEMS */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">
          Problems Faced and Conclusion
        </h3>

        <p>
          The primary challenge in this lab was managing multiple power
          sources and ensuring that the Arduino and motor driver shared a
          common ground. Another issue occurred when a servo wire detached
          near the end of testing, which prevented additional photos of the
          final configuration. Despite this, the earlier motor control
          sections demonstrated the intended behavior of the system and the
          concepts of PWM motor speed control and motor driver direction
          switching.
        </p>
      </div>

    </>
  );
}