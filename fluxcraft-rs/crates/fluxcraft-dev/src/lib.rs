use std::{
    io,
    net::{Ipv4Addr, SocketAddr},
    sync::Arc,
};

use tokio::{
    io::AsyncWriteExt,
    net::{TcpListener, TcpStream},
};

pub struct Server {
    port: u16,
    response: Arc<String>,
}

impl Server {
    pub fn new(port: u16, response: String) -> Self {
        Self {
            port,
            response: Arc::new(response),
        }
    }

    pub async fn start(&self) -> io::Result<()> {
        let addr = SocketAddr::new(std::net::IpAddr::V4(Ipv4Addr::LOCALHOST), self.port);
        let listener = TcpListener::bind(addr).await?;

        println!("Started server on: {}", addr);

        loop {
            let (stream, socket_addr) = listener.accept().await?;
            let response_body = self.response.clone();
            tokio::spawn(async move {
                Self::handle_connection(stream, socket_addr, response_body).await
            });
        }
    }

    async fn handle_connection(
        mut stream: TcpStream,
        socket_addr: SocketAddr,
        response_body: Arc<String>,
    ) -> io::Result<()> {
        println!("Received request from: {:?}", socket_addr);

        let headers = format!(
            concat!(
                "HTTP/1.1 200 OK\r\n",
                "content-length: {}\r\n",
                "Access-Control-Allow-Origin: *\r\n",
                "Content-Type: application/json\r\n",
                "\r\n"
            ),
            response_body.len()
        );

        stream.write_all(headers.as_bytes()).await?;
        stream.write_all(response_body.as_bytes()).await?;
        stream.flush().await?;

        Ok(())
    }
}
