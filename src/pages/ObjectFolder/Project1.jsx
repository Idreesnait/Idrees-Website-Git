 export default function Project1() {
  return (
    <>
      {/* OVERVIEW */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">Overview</h3>
        <p>
          Lab 1 (“All Wired Up”) introduced basic electronics concepts including
          power regulation, current flow, LED protection using resistors, and
          circuit control with a push button. The goal was to safely power a
          breadboard, calculate appropriate resistance using Ohm’s Law, and
          control an LED through physical interaction.
        </p>
      </div>

      {/* PROCESS */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">
          Process & Experiments
        </h3>
        <p>
          I first set up the power supply module on the breadboard and verified
          the 3.3V and 5V rails using a multimeter. I then tested LEDs directly
          on power to observe failure modes before introducing resistors.
          Using Ohm’s Law, I calculated safe resistance values and rebuilt the
          circuit to prevent LED burnout. Finally, I integrated a push button
          to control the LED, testing different pin configurations to avoid
          short circuits.
        </p>
      </div>

      {/* SYSTEM */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">How It Works</h3>
        <p>
          Power flows from the 9V battery into the power supply module, which
          regulates the voltage to 3.3V or 5V. The LED is placed in series with
          a resistor to limit current. When the push button is pressed, the
          circuit closes, allowing current to flow through the LED and turn it
          on. Releasing the button opens the circuit and stops current flow.
        </p>
      </div>

      {/* MATERIALS */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">Materials</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Elegoo Arduino Uno Starter Kit</li>
          <li>830-point breadboard</li>
          <li>Power supply module</li>
          <li>9V battery with barrel jack connector</li>
          <li>LEDs</li>
          <li>Resistors (100Ω & 180Ω used)</li>
          <li>Push button</li>
          <li>Jumper wires</li>
          <li>Multimeter</li>
        </ul>
      </div>

      {/* CALCULATIONS */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">Calculations</h3>

        <p className="mb-4">
          Using Ohm’s Law (V = I × R), appropriate resistor values were calculated
          to safely limit LED current.
        </p>

        <div className="space-y-4 text-sm">
          <div className="rounded-xl border bg-white/60 p-4 shadow-md shadow-black/15">
            <p className="font-medium text-foreground mb-1">
              3.3V Power Rail
            </p>
            <p>Assuming a target current of ~30 mA:</p>
            <p className="font-mono">
              R = 3.3V / 0.03A ≈ 110Ω
            </p>
            <p>
              A 100Ω resistor was used, resulting in approximately 33 mA of
              current, which is within safe limits.
            </p>
          </div>

          <div className="rounded-xl border bg-white/60 p-4 shadow-md shadow-black/15">
            <p className="font-medium text-foreground mb-1">
              5V Power Rail
            </p>
            <p>Targeting a current of ~28 mA:</p>
            <p className="font-mono">
              R = 5V / 0.028A ≈ 180Ω
            </p>
            <p>
              A 220Ω resistor was used due to availability, further reducing
              current and ensuring safe operation.
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
        src="/objectimages/3v1.png"
        alt="3.3V LED circuit schematic"
        className="rounded-xl border bg-white shadow-xl shadow-black/25"
      />
      <figcaption className="text-sm text-muted-foreground">
        3.3V LED circuit with a 100Ω resistor.
      </figcaption>
    </figure>

    <figure className="space-y-2">
      <img
        src="/objectimages/5v1.png"
        alt="5V LED circuit schematic"
        className="rounded-xl border bg-white shadow-xl shadow-black/25"
      />
      <figcaption className="text-sm text-muted-foreground">
        5V LED circuit using a higher-value resistor (180Ω–220Ω) to limit current.
      </figcaption>
    </figure>

    <figure className="space-y-2 md:col-span-2">
      <img
        src="/objectimages/b.png"
        alt="3.3V LED circuit with push button schematic"
        className="rounded-xl border bg-white shadow-xl shadow-black/25"
      />
      <figcaption className="text-sm text-muted-foreground">
        3.3V LED circuit controlled by a push button/switch.
      </figcaption>
    </figure>
  </div>
</div>

      {/* MEDIA */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-4">Images & Video</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <figure className="space-y-2">
            <img
              src="/objectimages/o1.JPG"
              alt="Power supply module on breadboard"
              className="rounded-xl border bg-white shadow-xl shadow-black/25"
            />
            <figcaption className="text-sm text-muted-foreground">
              Multimeter verifying 5V output on the breadboard rails.
            </figcaption>
          </figure>

          <figure className="space-y-2">
            <img
              src="/objectimages/o2.JPG"
              alt="Measuring voltage with multimeter"
              className="rounded-xl border bg-white shadow-xl shadow-black/25"
            />
            <figcaption className="text-sm text-muted-foreground">
              Multimeter verifying 3.3V output on the breadboard rails.
            </figcaption>
          </figure>

          <figure className="space-y-2">
            <img
              src="/objectimages/o3.JPG"
              alt="LED circuit with resistor"
              className="rounded-xl border bg-white shadow-xl shadow-black/25"
            />
            <figcaption className="text-sm text-muted-foreground">
              LED connected in series with a current-limiting resistor (5V).
            </figcaption>
          </figure>

          <figure className="space-y-2">
            <img
              src="/objectimages/o5.JPG"
              alt="LED powered safely"
              className="rounded-xl border bg-white shadow-xl shadow-black/25"
            />
            <figcaption className="text-sm text-muted-foreground">
              LED illuminated safely without overheating or burnout (3.3V).
            </figcaption>
          </figure>

          <figure className="space-y-2">
            <img
              src="/objectimages/o4.JPG"
              alt="Push button controlling LED"
              className="rounded-xl border bg-white shadow-xl shadow-black/25"
            />
            <figcaption className="text-sm text-muted-foreground">
              Push button used as a momentary switch to control the LED.
            </figcaption>
          </figure>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Footnote: Unfortunately, I was unable to record a video of the button
          activating the LED due to extended troubleshooting during lab. I worked
          closely with my LA (including testing on her breadboard), and while the
          circuit did successfully work, this occurred after class ended. My LA
          witnessed the successful operation.
        </p>
      </div>

      {/* CODE */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">Code</h3>
        <p>
          No microcontroller code was required for this lab.
        </p>
      </div>

      {/* REFERENCES */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">
          References & Sources
        </h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Course lecture, LA assistance, and lab slides</li>
        </ul>
      </div>
    </>
  );
}
