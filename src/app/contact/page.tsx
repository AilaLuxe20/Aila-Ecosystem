import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <section className="mx-auto max-w-7xl px-6 py-28">

        <div className="text-center">

          <p className="uppercase tracking-[0.45em] text-cyan-400">
            CONTACT
          </p>

          <h1 className="mt-6 text-7xl font-black">
            Let&apos;s Build
            <br />
            Something Incredible
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-slate-300">
            Tell us about your project and we&apos;ll help turn your vision into
            reality with AI-powered software.
          </p>

        </div>

        <div className="mt-24 grid gap-12 lg:grid-cols-2">

          <div className="glass rounded-[36px] p-10">

            <h2 className="text-4xl font-black">
              Send a Message
            </h2>

            <div className="mt-10 space-y-6">

              <input
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-6 py-4 outline-none"
                placeholder="Full Name"
              />

              <input
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-6 py-4 outline-none"
                placeholder="Email Address"
                type="email"
              />

              <input
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-6 py-4 outline-none"
                placeholder="Company"
              />

              <textarea
                rows={6}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-6 py-4 outline-none"
                placeholder="Tell us about your project..."
              />

              <button className="flex items-center rounded-2xl bg-cyan-500 px-8 py-4 font-semibold hover:bg-cyan-400">
                Send Inquiry
                <ArrowRight className="ml-3 h-5 w-5" />
              </button>

            </div>

          </div>

          <div className="space-y-8">

            <div className="glass rounded-[36px] p-10">

              <h2 className="text-4xl font-black">
                Contact Information
              </h2>

              <div className="mt-10 space-y-8">

                <div className="flex items-center gap-5">
                  <Mail className="h-8 w-8 text-cyan-400" />
                  <div>
                    <p className="text-slate-400">Email</p>
                    <h3 className="text-xl font-bold">
                      hello@ailaecosystem.com
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <Phone className="h-8 w-8 text-cyan-400" />
                  <div>
                    <p className="text-slate-400">Phone</p>
                    <h3 className="text-xl font-bold">
                      Available Upon Request
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <MapPin className="h-8 w-8 text-cyan-400" />
                  <div>
                    <p className="text-slate-400">Location</p>
                    <h3 className="text-xl font-bold">
                      Dubai • Nigeria • Worldwide
                    </h3>
                  </div>
                </div>

              </div>

            </div>

            <div className="rounded-[36px] border border-cyan-500/20 bg-cyan-500/10 p-10">

              <MessageCircle className="h-14 w-14 text-cyan-400" />

              <h2 className="mt-6 text-3xl font-black">
                Ready To Start?
              </h2>

              <p className="mt-4 leading-8 text-slate-300">
                We build AI software, enterprise platforms, websites,
                mobile applications and automation systems.
              </p>

            </div>

          </div>

        </div>

      </section>
    </main>
  );
}