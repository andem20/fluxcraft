use std::io;

use fluxcraft_dev::Server;

#[tokio::main]
async fn main() -> io::Result<()> {
    let server = Server();

    server.start().await?;

    Ok(())
}
