
import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const subjects = [
  "DBMS",
  "DSA",
  "Operating Systems",
  "Computer Networks",
  "AI",
];

const studentData = {
  DBMS: [
    { name: "Arun Kumar", marks: 92 },
    { name: "Priya S", marks: 81 },
    { name: "Rahul K", marks: 56 },
    { name: "Karthik M", marks: 74 },
    { name: "Divya R", marks: 95 },
  ],

  DSA: [
    { name: "Arun Kumar", marks: 88 },
    { name: "Priya S", marks: 76 },
    { name: "Rahul K", marks: 48 },
    { name: "Karthik M", marks: 69 },
    { name: "Divya R", marks: 91 },
  ],

  "Operating Systems": [
    { name: "Arun Kumar", marks: 84 },
    { name: "Priya S", marks: 72 },
    { name: "Rahul K", marks: 51 },
    { name: "Karthik M", marks: 67 },
    { name: "Divya R", marks: 89 },
  ],

  "Computer Networks": [
    { name: "Arun Kumar", marks: 79 },
    { name: "Priya S", marks: 87 },
    { name: "Rahul K", marks: 45 },
    { name: "Karthik M", marks: 71 },
    { name: "Divya R", marks: 94 },
  ],

  AI: [
    { name: "Arun Kumar", marks: 91 },
    { name: "Priya S", marks: 83 },
    { name: "Rahul K", marks: 59 },
    { name: "Karthik M", marks: 70 },
    { name: "Divya R", marks: 96 },
  ],
};

function getCategory(marks) {
  if (marks >= 80) return "High Mark";
  if (marks >= 60) return "Average";
  return "Slow Learner";
}

function Home() {
  const [selectedSubject, setSelectedSubject] = useState("DBMS");

  const students = studentData[selectedSubject];

  const passCount = students.filter(
    (student) => student.marks >= 40
  ).length;

  const slowCount = students.filter(
    (student) => student.marks < 60
  ).length;

  const averageMarks = Math.round(
    students.reduce((sum, student) => sum + student.marks, 0) /
      students.length
  );

  const highMarkCount = students.filter(
    (student) => student.marks >= 80
  ).length;

  const passPercentage = Math.round(
    (passCount / students.length) * 100
  );

  const slowPercentage = Math.round(
    (slowCount / students.length) * 100
  );

  const chartData = [
    {
      name: "Passed",
      value: passPercentage,
    },
    {
      name: "Slow Learners",
      value: slowPercentage,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ================= HEADER ================= */}

      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl">

        <div className="flex items-center justify-between px-8 py-5">

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              AI Teacher Assistant
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Student Performance Intelligence Dashboard
            </p>
          </div>

          <div className="flex items-center gap-3">

            <button
              className="
                rounded-xl border border-slate-700
                bg-slate-800 px-4 py-2
                text-sm transition
                hover:bg-slate-700
              "
            >
              🔔 Notifications
            </button>

            <button
              className="
                rounded-xl bg-blue-600
                px-5 py-2 text-sm font-semibold
                transition hover:bg-blue-500
              "
            >
              Profile
            </button>

          </div>

        </div>

      </header>


      {/* ================= MAIN ================= */}

      <main className="mx-auto max-w-7xl px-8 py-8">

        {/* PAGE TITLE */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold">
            Performance Overview
          </h2>

          <p className="mt-2 text-slate-400">
            Monitor student performance and identify learners
            who need additional support.
          </p>

        </div>


        {/* ================= SUBJECT SELECTOR ================= */}

        <div
          className="
            mb-8 flex flex-col gap-4
            rounded-2xl border border-slate-800
            bg-slate-900 p-5
            md:flex-row md:items-center
            md:justify-between
          "
        >

          <div>

            <p className="text-sm text-slate-400">
              Currently analysing
            </p>

            <h3 className="mt-1 text-xl font-semibold">
              {selectedSubject}
            </h3>

          </div>


          <div>

            <label className="mb-2 block text-sm text-slate-400">
              Select Subject
            </label>

            <select
              value={selectedSubject}
              onChange={(event) =>
                setSelectedSubject(event.target.value)
              }
              className="
                rounded-xl border border-slate-700
                bg-slate-800 px-4 py-3
                text-white outline-none
                focus:border-blue-500
              "
            >

              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}

            </select>

          </div>

        </div>


        {/* ================= STAT CARDS ================= */}

        <div className="mb-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

          {/* PASS RATE */}

          <div
            className="
              rounded-2xl border border-slate-800
              bg-slate-900 p-6
              transition hover:-translate-y-1
            "
          >

            <p className="text-sm text-slate-400">
              Pass Rate
            </p>

            <h3 className="mt-3 text-4xl font-bold text-emerald-400">
              {passPercentage}%
            </h3>

            <p className="mt-2 text-xs text-slate-500">
              {passCount} of {students.length} students passed
            </p>

          </div>


          {/* AVERAGE */}

          <div
            className="
              rounded-2xl border border-slate-800
              bg-slate-900 p-6
              transition hover:-translate-y-1
            "
          >

            <p className="text-sm text-slate-400">
              Class Average
            </p>

            <h3 className="mt-3 text-4xl font-bold text-blue-400">
              {averageMarks}
            </h3>

            <p className="mt-2 text-xs text-slate-500">
              Average marks
            </p>

          </div>


          {/* HIGH MARK */}

          <div
            className="
              rounded-2xl border border-slate-800
              bg-slate-900 p-6
              transition hover:-translate-y-1
            "
          >

            <p className="text-sm text-slate-400">
              High Performers
            </p>

            <h3 className="mt-3 text-4xl font-bold text-purple-400">
              {highMarkCount}
            </h3>

            <p className="mt-2 text-xs text-slate-500">
              Students above 80 marks
            </p>

          </div>


          {/* SLOW LEARNERS */}

          <div
            className="
              rounded-2xl border border-slate-800
              bg-slate-900 p-6
              transition hover:-translate-y-1
            "
          >

            <p className="text-sm text-slate-400">
              Slow Learners
            </p>

            <h3 className="mt-3 text-4xl font-bold text-red-400">
              {slowCount}
            </h3>

            <p className="mt-2 text-xs text-slate-500">
              {slowPercentage}% of the class
            </p>

          </div>

        </div>


        {/* ================= CHART + AI INSIGHT ================= */}

        <div className="mb-8 grid gap-6 lg:grid-cols-2">


          {/* PIE CHART */}

          <div
            className="
              rounded-2xl border border-slate-800
              bg-slate-900 p-6
            "
          >

            <div className="mb-4">

              <h3 className="text-lg font-semibold">
                {selectedSubject} Performance
              </h3>

              <p className="text-sm text-slate-500">
                Pass vs slow learner distribution
              </p>

            </div>


            <div className="h-72">

              <ResponsiveContainer width="100%" height="100%">

                <PieChart>

                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={4}
                    label={({ name, value }) =>
                      `${name}: ${value}%`
                    }
                  >

                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />

                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>


          {/* AI INSIGHT */}

          <div
            className="
              rounded-2xl border border-blue-900
              bg-gradient-to-br
              from-blue-950 to-slate-900
              p-6
            "
          >

            <div className="mb-5 flex items-center gap-3">

              <div
                className="
                  flex h-11 w-11 items-center
                  justify-center rounded-xl
                  bg-blue-600 text-xl
                "
              >
                ✨
              </div>

              <div>

                <h3 className="font-semibold">
                  AI Performance Insight
                </h3>

                <p className="text-xs text-blue-300">
                  Generated analysis
                </p>

              </div>

            </div>


            <p className="leading-7 text-slate-300">

              {slowCount > 0
                ? `The analysis indicates that ${slowCount} student${
                    slowCount > 1 ? "s" : ""
                  } may require additional support in ${selectedSubject}. `
                : `Overall performance in ${selectedSubject} is strong. `}
              
              The class average is{" "}
              <span className="font-semibold text-white">
                {averageMarks}
              </span>{" "}
              marks, with a pass rate of{" "}
              <span className="font-semibold text-emerald-400">
                {passPercentage}%
              </span>.
              
            </p>


            <div
              className="
                mt-6 rounded-xl
                border border-blue-900
                bg-blue-950/40 p-4
              "
            >

              <p className="text-sm font-medium text-blue-300">
                Recommended Action
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">

                Focus on personalised practice questions,
                revision materials and targeted explanations
                for students below the class average.

              </p>

            </div>

          </div>

        </div>


        {/* ================= STUDENT TABLE ================= */}

        <div
          className="
            overflow-hidden rounded-2xl
            border border-slate-800
            bg-slate-900
          "
        >

          <div
            className="
              flex flex-col gap-3
              border-b border-slate-800
              p-6 md:flex-row
              md:items-center
              md:justify-between
            "
          >

            <div>

              <h3 className="text-lg font-semibold">
                Student Performance
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Detailed performance for {selectedSubject}
              </p>

            </div>

            <span
              className="
                w-fit rounded-full
                bg-blue-950 px-4 py-2
                text-xs font-medium
                text-blue-300
              "
            >
              {students.length} Students
            </span>

          </div>


          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-slate-950/70">

                <tr className="text-xs uppercase tracking-wider text-slate-500">

                  <th className="px-6 py-4">
                    S.No
                  </th>

                  <th className="px-6 py-4">
                    Student
                  </th>

                  <th className="px-6 py-4">
                    Subject
                  </th>

                  <th className="px-6 py-4">
                    Marks
                  </th>

                  <th className="px-6 py-4">
                    Performance
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-800">

                {students.map((student, index) => {

                  const category = getCategory(student.marks);

                  return (

                    <tr
                      key={student.name}
                      className="
                        transition
                        hover:bg-slate-800/50
                      "
                    >

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {String(index + 1).padStart(2, "0")}
                      </td>


                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div
                            className="
                              flex h-9 w-9
                              items-center justify-center
                              rounded-full bg-blue-600/20
                              text-sm font-semibold
                              text-blue-400
                            "
                          >
                            {student.name.charAt(0)}
                          </div>

                          <span className="font-medium">
                            {student.name}
                          </span>

                        </div>

                      </td>


                      <td className="px-6 py-4 text-sm text-slate-400">
                        {selectedSubject}
                      </td>


                      <td className="px-6 py-4">

                        <span className="font-semibold">
                          {student.marks}
                        </span>

                        <span className="text-slate-600">
                          /100
                        </span>

                      </td>


                      <td className="px-6 py-4">

                        <span
                          className={`
                            rounded-full px-3 py-1
                            text-xs font-medium
                            ${
                              category === "High Mark"
                                ? "bg-emerald-950 text-emerald-400"
                                : category === "Average"
                                ? "bg-yellow-950 text-yellow-400"
                                : "bg-red-950 text-red-400"
                            }
                          `}
                        >
                          {category}
                        </span>

                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Home