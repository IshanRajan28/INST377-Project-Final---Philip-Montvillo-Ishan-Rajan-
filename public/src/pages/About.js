// This'll be that static about page where we explain the purposes of the vulnerability tracking app. 
function About() {
  return (
    <main className="aboutPage">
      <section className="aboutCard">
        <h1>About This Project</h1>

        <p>
          This vulnerability tracking app helps users monitor security threats that are 
          connected to the technologies they actually care about. Instead of having to manually 
          search through large vulnerability databases, users can build a watchlist and view 
          any relevant CVE information in one place!
        </p>

        <h2>The Problem</h2>

        <p>
            Cybersecurity information can be difficult to sift through as vulnerability databases
            often contain thousands of CVEs across many different technologies. This can lead to 
            information overload for respective developers and DevOps teams and make it difficult
            to find threats that actually apply to stacks/technologies that they use. 
        </p>

        <h2>Our Solution</h2>

        <p>
            Our app will let users create a persistent watchlist using Supabase. The backend then uses 
            these saved technologies to request vulnerability information from the National 
            Vulnerability Database (NVD). This allows the dashboard to show a curated list of CVEs that
            are relevant to the user and their selected technologies. 
        </p>

        <h2>Technologies Used</h2>
        <ul>
            <li>React helped us build the frontend interface.</li>
            <li>Node.js and Express are used to create backend API routes.</li>
            <li>Supabase is used to store user watchlist data.</li>
            <li>The NVD Database API is used to retrieve CVE information.</li>
        </ul>
      </section>
    </main>
  );
}

export default About;