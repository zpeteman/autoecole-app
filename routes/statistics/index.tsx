import { Head } from "$fresh/runtime.ts";
import Layout from "../../components/Layout.tsx";
import { Database } from "../../db/kv.ts";
import StatisticsList from "../../islands/StatisticsList.tsx";

export default async function Statistics() {
  const students = await Database.listStudents();
  const exams = await Database.listExams();
  const payments = await Database.listPayments();

  return (
    <>
      <Head>
        <title>Auto École - Statistiques</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
      </Head>
      <Layout>
        <StatisticsList students={students} exams={exams} payments={payments} />
      </Layout>
    </>
  );
} 