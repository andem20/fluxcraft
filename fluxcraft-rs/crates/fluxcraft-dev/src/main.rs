use std::io;

use fluxcraft_dev::Server;

#[tokio::main]
async fn main() -> io::Result<()> {
    let server = Server::new(9999, "Hello".to_owned());

    println!("Starting server...");
    server.start().await?;

    Ok(())
}
