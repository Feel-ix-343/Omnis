# start by pulling the python image
FROM rust:1.67

COPY ./omnis-algo /app

WORKDIR /app

RUN ls
RUN cargo install --path .

EXPOSE 8080

CMD ["omnis-algo"]
