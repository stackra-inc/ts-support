/**
 * @file pages/container.tsx
 * @description DI Container demo page.
 *
 * Demonstrates @abdokouta/ts-container:
 *   - @Injectable() decorator
 *   - @Inject() for constructor injection
 *   - @Module() with providers
 *   - useInject() hook to resolve services
 *   - Service-to-service dependencies
 */

import { useState, useEffect } from "react";
import { Injectable, Module, Inject } from "@abdokouta/ts-container";
import { useInject, ContainerProvider } from "@abdokouta/ts-container-react";
import { ApplicationContext } from "@abdokouta/ts-application";

import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

// ---------------------------------------------------------------------------
// Demo services
// ---------------------------------------------------------------------------

@Injectable()
class CounterService {
  private count = 0;
  increment(): number {
    return ++this.count;
  }
  getCount(): number {
    return this.count;
  }
  reset(): void {
    this.count = 0;
  }
}

@Injectable()
class GreeterService {
  constructor(@Inject(CounterService) private readonly counter: CounterService) {}

  greet(name: string): string {
    const count = this.counter.getCount();
    return `Hello, ${name}! You have clicked ${count} time${count !== 1 ? "s" : ""}.`;
  }
}

@Module({
  providers: [CounterService, GreeterService],
  exports: [CounterService, GreeterService],
})
class DemoModule {}

// ---------------------------------------------------------------------------
// Demo widgets (rendered inside ContainerProvider)
// ---------------------------------------------------------------------------

function CounterWidget() {
  const counter = useInject(CounterService);
  const [display, setDisplay] = useState(counter.getCount());

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-divider p-6">
      <p className="text-sm text-default-500">CounterService (Singleton)</p>
      <span className="text-5xl font-bold tabular-nums">{display}</span>
      <div className="flex gap-2">
        <button
          className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
          onClick={() => {
            counter.increment();
            setDisplay(counter.getCount());
          }}
        >
          +1
        </button>
        <button
          className="rounded-lg border border-divider px-4 py-2 text-sm"
          onClick={() => {
            counter.reset();
            setDisplay(0);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function GreeterWidget() {
  const greeter = useInject(GreeterService);
  const [name, setName] = useState("World");
  const [greeting, setGreeting] = useState(greeter.greet("World"));

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-divider p-6">
      <p className="text-sm text-default-500">GreeterService (depends on CounterService)</p>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-divider bg-default-100 px-3 py-2 text-sm outline-none focus:border-primary"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setGreeting(greeter.greet(name))}
          placeholder="Your name"
        />
        <button
          className="rounded-lg bg-default-200 px-4 py-2 text-sm"
          onClick={() => setGreeting(greeter.greet(name))}
        >
          Greet
        </button>
      </div>
      <p className="rounded-lg bg-default-100 px-3 py-2 text-sm font-mono">{greeting}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ContainerPage() {
  const [demoApp, setDemoApp] = useState<ApplicationContext | null>(null);

  useEffect(() => {
    ApplicationContext.create(DemoModule).then(setDemoApp);
  }, []);

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-8 py-8 md:py-10">
        <div>
          <h1 className={title()}>Container Package</h1>
          <p className={subtitle({ class: "mt-2" })}>
            @abdokouta/ts-container — NestJS-style dependency injection
          </p>
        </div>

        {/* Concept cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              icon: "💉",
              label: "@Injectable()",
              desc: "Mark a class as a DI-managed service.",
            },
            {
              icon: "📦",
              label: "@Module()",
              desc: "Group providers and imports into modules.",
            },
            {
              icon: "🪝",
              label: "useInject()",
              desc: "React hook to resolve a service from DI.",
            },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-divider p-4">
              <span className="text-3xl">{item.icon}</span>
              <p className="mt-2 font-mono text-sm font-semibold text-primary">{item.label}</p>
              <p className="mt-1 text-xs text-default-500">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Live demo */}
        <div className="rounded-xl border border-divider p-6">
          <h2 className="text-lg font-semibold">Live Demo — DemoModule</h2>
          <p className="mb-4 text-sm text-default-500">
            CounterWidget and GreeterWidget share the same CounterService singleton.
          </p>

          {demoApp ? (
            <ContainerProvider context={demoApp}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <CounterWidget />
                <GreeterWidget />
              </div>
            </ContainerProvider>
          ) : (
            <p className="text-sm text-default-400">Bootstrapping DemoModule...</p>
          )}
        </div>

        {/* Code snippet */}
        <div className="rounded-xl border border-divider p-6">
          <h2 className="mb-4 text-lg font-semibold">How It Works</h2>
          <pre className="overflow-x-auto rounded-lg bg-default-100 p-4 text-xs font-mono">
            {`@Injectable()
class CounterService {
  private count = 0;
  increment() { return ++this.count; }
}

@Injectable()
class GreeterService {
  constructor(
    @Inject(CounterService) private counter: CounterService
  ) {}
  greet(name: string) {
    return \`Hello \${name}! Clicks: \${this.counter.getCount()}\`;
  }
}

@Module({ providers: [CounterService, GreeterService] })
class DemoModule {}

// In React:
function MyComponent() {
  const counter = useInject(CounterService);
  return <button onClick={() => counter.increment()}>+1</button>;
}`}
          </pre>
        </div>
      </section>
    </DefaultLayout>
  );
}
