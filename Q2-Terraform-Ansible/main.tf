provider "local" {}

resource "local_file" "devops_file" {
  content  = "Hello from Terraform 🚀"
  filename = "terraform_output.txt"
}