const sentimentForm = document.getElementById("search-mood");

async function query(data) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/SamLowe/roberta-base-go_emotions",
    {
      headers: {
        Authorization: "Bearer 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",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  const result = await response.json();
  return result;
}

sentimentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Get the value of the query input field
  const queryInput = document.getElementById("moodQuery").value;

  query({
    inputs: queryInput,
  }).then((response) => {
    const results = response[0].filter((res) => res.score > 0.005);
    console.log(results[0]);
  });
});

// query({
//   inputs: "i am feeling down",
// }).then((response) => {
//   const results = response[0].filter((res) => res.score > 0.005);
//   console.log(results[0]);
// });
