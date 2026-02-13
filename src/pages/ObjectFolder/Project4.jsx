export default function Project4() {
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

      {/* PART 1 */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-4">
          Part 1 – Using a Potentiometer
        </h3>

        {/* DESCRIPTION */}
        <p className="mb-4">filler</p>

        {/* SCHEMATIC */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <figure className="space-y-2">
            <img
              src="/objectimages/p4p1schematic.JPG"
              alt="Potentiometer schematic"
              className="rounded-xl border bg-white shadow-xl shadow-black/25"
            />
            <figcaption className="text-sm text-muted-foreground">
              filler
            </figcaption>
          </figure>

          <figure className="space-y-2">
            <img
              src="/objectimages/p4p1circuit.JPG"
              alt="Potentiometer circuit"
              className="rounded-xl border bg-white shadow-xl shadow-black/25"
            />
            <figcaption className="text-sm text-muted-foreground">
              filler
            </figcaption>
          </figure>
        </div>

        {/* CODE */}
        <h4 className="font-medium text-foreground mb-2">Code</h4>
        <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`// filler`}
        </pre>

        {/* VIDEO */}
        <video
          src="/objectimages/p4p1video.MOV"
          controls
          className="rounded-xl border bg-white shadow-xl shadow-black/25 mt-4"
        />
      </div>

      {/* PART 2 */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-4">
          Part 2 – Light ‘Em Up with a Potentiometer
        </h3>

        <p className="mb-4">filler</p>

        {/* SCHEMATIC / IMAGE */}
        <figure className="space-y-2 mb-6">
          <img
            src="/objectimages/p4p2circuit.JPG"
            alt="5 LED linear circuit with potentiometer"
            className="rounded-xl border bg-white shadow-xl shadow-black/25"
          />
          <figcaption className="text-sm text-muted-foreground">
            filler
          </figcaption>
        </figure>

        {/* CODE */}
        <h4 className="font-medium text-foreground mb-2">Code</h4>
        <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`// filler`}
        </pre>

        <video
          src="/objectimages/p4p2video.MOV"
          controls
          className="rounded-xl border bg-white shadow-xl shadow-black/25 mt-4"
        />
      </div>

      {/* PART 3 */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-4">
          Part 3 – Joystick Input
        </h3>

        <p className="mb-4">filler</p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <figure className="space-y-2">
            <img
              src="/objectimages/p4p3schematic.JPG"
              alt="Joystick schematic"
              className="rounded-xl border bg-white shadow-xl shadow-black/25"
            />
            <figcaption className="text-sm text-muted-foreground">
              filler
            </figcaption>
          </figure>

          <figure className="space-y-2">
            <img
              src="/objectimages/p4p3circuit.JPG"
              alt="Joystick circuit"
              className="rounded-xl border bg-white shadow-xl shadow-black/25"
            />
            <figcaption className="text-sm text-muted-foreground">
              filler
            </figcaption>
          </figure>
        </div>

        <h4 className="font-medium text-foreground mb-2">Code</h4>
        <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`// filler`}
        </pre>

        <video
          src="/objectimages/p4p3video.MOV"
          controls
          className="rounded-xl border bg-white shadow-xl shadow-black/25 mt-4"
        />
      </div>

      {/* PART 4 */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-4">
          Part 4 – Light ‘Em Up with a Joystick
        </h3>

        <p className="mb-4">filler</p>

        <figure className="space-y-2 mb-6">
          <img
            src="/objectimages/p4p4circuit.JPG"
            alt="Plus LED arrangement with joystick"
            className="rounded-xl border bg-white shadow-xl shadow-black/25"
          />
          <figcaption className="text-sm text-muted-foreground">
            filler
          </figcaption>
        </figure>

        <h4 className="font-medium text-foreground mb-2">Code</h4>
        <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`// filler`}
        </pre>

        <video
          src="/objectimages/p4p4video.MOV"
          controls
          className="rounded-xl border bg-white shadow-xl shadow-black/25 mt-4"
        />
      </div>

      {/* PART 5 */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-4">
          Part 5 – Basic LED Whack-A-MoLED
        </h3>

        <p className="mb-4">filler</p>

        <h4 className="font-medium text-foreground mb-2">Code</h4>
        <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`// filler`}
        </pre>

        <video
          src="/objectimages/p4p5video.MOV"
          controls
          className="rounded-xl border bg-white shadow-xl shadow-black/25 mt-4"
        />
      </div>

      {/* EXTRA VOLT */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-4">
          Extra Volt – Advanced Whack-A-MoLED
        </h3>

        <p className="mb-4">filler</p>

        <h4 className="font-medium text-foreground mb-2">Code</h4>
        <pre className="rounded-xl bg-black/80 p-4 text-sm text-green-200 overflow-x-auto">
{`// filler`}
        </pre>

        <video
          src="/objectimages/p4extra.MOV"
          controls
          className="rounded-xl border bg-white shadow-xl shadow-black/25 mt-4"
        />
      </div>

      {/* PROBLEMS */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">
          Problems Faced & Conclusion
        </h3>
        <p>filler</p>
      </div>

      {/* REFERENCES */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">
          References & Sources
        </h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Arduino Documentation</li>
          <li>ATLS 3300 Lecture Slides</li>
          <li>filler</li>
        </ul>
      </div>
    </>
  );
}
