// const paths = [
//   "/production-schedule",
//   "/shop-drawings",
//   "/panel-matrix",
//   "/takeoff-matrix",
//   "/fab-matrix",
//   "/all-activities",
//   "/glass-and-gasket",
//   "/metal",
//   "/field",
//   "/packaging",
//   "/purchasing",
//   "/jmp-field-tracking",
// ];
const paths = ["/production-schedule", "/shop-drawings"];

export default async function handler(req, res) {
  // Check for secret to confirm this is a valid request

  // if (req.query.secret !== process.env.MY_SECRET_TOKEN) {
  //   return res.status(401).json({ message: 'Invalid token' })
  // }
  //console.log("requst", req);
  //console.log("res", res);
  //try {
  //const paths = await api.pathsToRevalidate();
  //console.log(paths);

  // // Revalidate every path
  // await Promise.all(paths.map(res.revalidate))
  //paths.forEach(res.revalidate);
  for (let path of paths) {
    try {
      await res.revalidate(path);
      console.log("revalidated", path);
      return res.json({ revalidated: true });
    } catch (error) {
      console.log(error);
    }

    // }

    //await res.revalidate("/");

    // Return a response to confirm everything went ok
    //return res.json({ revalidated: true });
    //} catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    //return res.status(500).send("Error revalidating: " + err);
  }
}
