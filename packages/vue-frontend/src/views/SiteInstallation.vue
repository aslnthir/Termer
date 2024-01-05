<license>
  Vertraulich
</license>

<template>
  <div>
  <div class="main">
    <h1>
      How to install Tingtun Termer on a web page
    </h1>
      <h2>
        Include the Termer script on the web page. Include in the script in page templates to use it on multiples pages on a web site
      </h2>
      <div class="code">
        &lt;script <br>
          type="text/javascript" <br>
          id="tingtunGlossary" <br>
          src="https://termer.no/glossaryjs/glossary.js"&gt;<br>
          &lt;/script&gt;

      </div>
      <h2>
        Include the Termer script on a web page. Version with configurations set
      </h2>
      <div class="code">
        &lt;script type="text/javascript"<br>
        id="tingtunGlossary"<br>
        data-enable="true"<br>
        data-apikey="example_api_key"<br>
        data-markupstyle="underline"<br>
        data-notmarkpopup="false"<br>
        src="https://termer.no/glossaryjs/glossary.js"&gt;<br>
    &lt;/script&gt;
      </div>
      <h2>
        Optional fields for script tag
      </h2>
      <p>You may set the configuration in the script tag or in a JSON file. Example</p>
        <div class="code">
          {<br>
            "enabled": "true",<br>
            "apikey": "example_api_key"<br>
          }
        </div>
      <p>To place the configuration in a JSON file, add "data-confFile" to the script tag with a URL to the configuration file.
      If you prefer to have the configuration in the script HTML-element as attributes, add "data-" to all the different attributes.
      The "enable" attribute default value is "true". When set to "false" the user will need to manually enable Termer using the Termer button.</p>
      <p>The apikey is used to preselect glossary sources. Set the "apikey" attribute to the apikey value you have received.
      Default is an empty string.</p>
      <p>Termer can markup concepts available for lookup with, "underline" or "highlight". Termer uses "highlight" by default.</p>

      <p>To turn off markup inside the popup set "notmarkpopup" to "true", default is "false".</p>

      <h2>Termer button</h2>
      <div class="code">
      &lt;div id="tingtun-termer-button"&gt;&lt;/div&gt;
      </div>
      <p>The script will place the button inside this div element. Simply add this
  element to the location where you want the button to be placed on the page. </p>

      <h2>Disable markup on parts of a web page</h2>
      <p>To disable markup on parts of a web page, add the class "tingtun-not-mark" to the HTML element. Example below</p>
      <div class="code">
      &lt;div class="someclass tingtun-not-mark"&gt;
      </div>

      <h2>Linked PDF documents can be opened in the PDF viewer</h2>
      <p>To make sure that PDF documents linked from the web page can be opened in the PDF viewer you need to make sure the links are of the form as follows:
      "https://domain-name.no/pdf-file-name.pdf". In some cases the link is provided to download a PDF file, such as "https://domain-name.no/wp-content/download.php?id=xyz".
      Such download links will not open the the PDF-viewer. </p>

    </div>
  </div>
</template>

<script>

export default {
  name: 'installguide',
  components: {
  }
}
</script>

<style lang="sass" scoped>
.main
  padding-left: 2em

.code
  background: var(--termer-code-snippets-background)
  border-radius: 1em
  padding: 1em
  margin-left: 2em
  display: inline-block

p
  padding-left: 1em
  display: block
  margin-top: 1em
  margin-bottom: 1em
  margin-left: 0
  margin-right: 0
</style>
