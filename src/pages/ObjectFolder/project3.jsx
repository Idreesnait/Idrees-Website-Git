export default function Project() {
  return (
    <>
      {/* OVERVIEW */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">Overview</h3>
        <p>
          Lab 3 focused on soldering fundamentals for physical prototyping.
          The goal was to learn safe soldering practices, create clean and
          reliable solder joints, form solder traces on a protoboard, and
          splice wires for durable electrical connections.
        </p>
      </div>

      {/* MATERIALS */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">Materials Used</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>22G stranded wire</li>
          <li>22G solid-core wire</li>
          <li>Lead-free rosin-core solder</li>
          <li>Soldering iron & stand</li>
          <li>Fume extractor</li>
          <li>Brass wire pad</li>
          <li>Helping hands</li>
          <li>Wire strippers & diagonal pliers</li>
          <li>Safety glasses</li>
        </ul>
      </div>

      {/* PART 1 */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-4">
          Part 1 – Soldering Setup & Safety
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <figure className="space-y-2">
            <img
              src="/objectimages/all.JPG"
              alt="Soldering station setup"
              className="rounded-xl border bg-white shadow-xl shadow-black/25 max-h-80 w-full object-cover"
            />
            <figcaption className="text-sm text-muted-foreground">
              Fully assembled soldering station with proper safety equipment.
            </figcaption>
          </figure>

          <figure className="space-y-2">
            <img
              src="/objectimages/cl1.JPG"
              alt="Clean soldering iron tip"
              className="rounded-xl border bg-white shadow-xl shadow-black/25 max-h-80 w-full object-cover"
            />
            <figcaption className="text-sm text-muted-foreground">
              Properly tinned and cleaned soldering iron tip.
            </figcaption>
          </figure>
        </div>
      </div>

      {/* PART 2 */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-4">
          Part 2 – Soldering Wires to Protoboard
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <figure key={n} className="space-y-2">
              <img
                src={`/objectimages/sod${n}.JPG`}
                alt={`Solder joint ${n}`}
                className="rounded-xl border bg-white shadow-xl shadow-black/25 max-h-56 w-full object-cover"
              />
              <figcaption className="text-sm text-muted-foreground">
                Individual solder joint with clean coverage.
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

    {/* PART 3 */}
<div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
  <h3 className="font-medium text-foreground mb-4">
    Part 3 – Solder Bridges & Traces
  </h3>

  <div className="grid md:grid-cols-3 gap-6">
    {/* BRIDGE 1 */}
    <figure className="space-y-2">
      <img
        src="/objectimages/br1.JPG"
        alt="Unfortuantely, I forgot to capture the initial solder bridge photo."
        className="rounded-xl border bg-white shadow-xl shadow-black/25 max-h-56 w-full object-cover"
      />
      <figcaption className="text-sm text-muted-foreground">
        Bridge 1/3. Initial solder bridge created during trace practice. Photo
        was unfortunately not captured.
      </figcaption>
    </figure>

    {/* BRIDGE 2 */}
    <figure className="space-y-2">
      <img
        src="/objectimages/br2.JPG"
        alt="Second solder bridge connecting adjacent joints"
        className="rounded-xl border bg-white shadow-xl shadow-black/25 max-h-56 w-full object-cover"
      />
      <figcaption className="text-sm text-muted-foreground">
        Bridge 2/3. Solder trace connecting adjacent protoboard joints.
      </figcaption>
    </figure>

    {/* BRIDGE 3 */}
    <figure className="space-y-2">
      <img
        src="/objectimages/br3.JPG"
        alt="Third solder bridge forming a clean trace"
        className="rounded-xl border bg-white shadow-xl shadow-black/25 max-h-56 w-full object-cover"
      />
      <figcaption className="text-sm text-muted-foreground">
        Bridge 3/3. Final solder bridge demonstrating improved control and
        cleaner solder flow.
      </figcaption>
    </figure>
  </div>
</div>


     {/* PART 4 */}
<div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
  <h3 className="font-medium text-foreground mb-4">
    Part 4 – Wire Splicing
  </h3>

  <div className="grid md:grid-cols-2 gap-6">
    {/* SPLICE 1 */}
    <figure className="space-y-2">
      <img
        src="/objectimages/sp1.JPG"
        alt="Wire splice 1 of 3"
        className="rounded-xl border bg-white shadow-xl shadow-black/25 max-h-64 w-full object-cover"
      />
      <figcaption className="text-sm text-muted-foreground">
        Splice 1/3. First wire splice formed by tinning and fusing stranded wires.
      </figcaption>
    </figure>

    {/* SPLICE 2 */}
    <figure className="space-y-2">
      <img
        src="/objectimages/sp2.JPG"
        alt="Wire splice 2 of 3"
        className="rounded-xl border bg-white shadow-xl shadow-black/25 max-h-64 w-full object-cover"
      />
      <figcaption className="text-sm text-muted-foreground">
        Splice 2/3. Continued wire splicing with improved solder flow control.
      </figcaption>
    </figure>

    {/* SPLICE 3 */}
    <figure className="space-y-2">
      <img
        src="/objectimages/sp3.JPG"
        alt="Wire splice 3 of 3"
        className="rounded-xl border bg-white shadow-xl shadow-black/25 max-h-64 w-full object-cover"
      />
      <figcaption className="text-sm text-muted-foreground">
        Splice 3/3. Final splice completing the extended wire connection.
      </figcaption>
    </figure>

    {/* FINAL ASSEMBLY */}
    <figure className="space-y-2">
      <img
        src="/objectimages/sp4.JPG"
        alt="Fully soldered wire assembly"
        className="rounded-xl border bg-white shadow-xl shadow-black/25 max-h-64 w-full object-cover"
      />
      <figcaption className="text-sm text-muted-foreground">
        Fully assembled wire with all splice joints completed and soldered.
      </figcaption>
    </figure>
  </div>
</div>


      {/* CONCLUSION */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">
          Problems Faced & Conclusion
        </h3>
        <p>
          The main challenge was controlling solder flow to avoid excess buildup.
          Regular tip cleaning and careful heat control significantly improved
          joint quality.
        </p>
        <p className="mt-3">
          This lab built foundational soldering skills that will be essential
          for future physical computing and fabrication projects.
        </p>
      </div>

      {/* REFERENCES */}
      <div className="rounded-2xl border bg-white/70 p-6 shadow-xl shadow-black/20">
        <h3 className="font-medium text-foreground mb-2">
          References & Sources
        </h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>ATLS 3300 Lab Documentation</li>
        </ul>
      </div>
    </>
  );
}
