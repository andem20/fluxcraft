use std::{io, net::SocketAddr};

use tokio::{
    io::AsyncWriteExt,
    net::{TcpListener, TcpStream},
};

pub struct Server();

impl Server {
    pub async fn start(&self) -> io::Result<()> {
        let listener = TcpListener::bind("127.0.0.1:9999").await?;

        loop {
            let (stream, socket_addr) = listener.accept().await?;
            tokio::spawn(async move { Self::handle_connection(stream, socket_addr).await });
        }
    }

    async fn handle_connection(mut stream: TcpStream, socket_addr: SocketAddr) -> io::Result<()> {
        println!("Received request from: {:?}", socket_addr);

        let body = "Hello\n";
        let headers = format!("HTTP/1.1 200 OK\ncontent-length: {};\n\n", body.len());

        stream.write_all(headers.as_bytes()).await?;
        stream.write_all(body.as_bytes()).await?;
        stream.flush().await?;

        Ok(())
    }
}
