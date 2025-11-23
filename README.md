# POD Playground

A real-time, browser-based previewer for Perl's **Plain Old Documentation (POD)** format.

This tool helps module authors write and check their POD syntax instantly. While it aims to approximate the visual style of [MetaCPAN](https://metacpan.org) to give you a good idea of how your documentation will look, it is a lightweight client-side simulation and not a 1:1 renderer.

---

## Use Online

You don't need to install anything. The easiest way to use POD Playground is to visit the live version hosted on GitHub:

👉 **[Launch POD Playground](https://regcostajr.github.io/pod-playground)**

---

## Features

* **Live Preview:** See changes instantly as you type.
* **MetaCPAN-Inspired Styling:** Uses custom CSS to mimic the general typography, colors, and layout of MetaCPAN to help you visualize the final output.
* **Client-Side Parsing:** Custom JavaScript parser (no backend Perl required).

## Local Usage (Optional)

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/regcostajr/pod-playground.git](https://github.com/regcostajr/pod-playground.git)
    cd pod-playground
    ```

2.  **Open it:**
    Simply open `index.html` in your web browser.

## Supported Tags

| Tag | Description | Example |
| :--- | :--- | :--- |
| `=head1` - `=head4` | Headers | `=head1 NAME` |
| `=over` / `=back` | Indentation/Lists | `=over 4` ... `=back` |
| `=item *` / `=item 1.` | Bullet/Numbered Lists | `=item * Point` |
| `B<...>` | **Bold** | `B<Text>` |
| `I<...>` | *Italic* | `I<Text>` |
| `C<...>` | `Code` | `C<$var>` |
| `C<< ... >>` | `Complex Code` | `C<< $a->{b} >>` |
| `L<...>` | [Links](https://metacpan.org) | `L<Label\|URL>` |

## Author

**Reginaldo Costa** | [@regcostajr](https://github.com/regcostajr)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
