type Props = {
  params: { experienceId: string };
};

export default function ExperiencePage({ params }: Props) {
  const { experienceId } = params;
  return (
    <main className="min-h-screen p-8 flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Experience</h1>
      <p className="text-zinc-600 dark:text-zinc-300">
        Viewing experience: <span className="font-mono">{experienceId}</span>
      </p>
    </main>
  );
}


